<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

ini_set('display_errors', '0');

// Deploy this file as public_html/api/enquiry.php. The private config belongs
// ABOVE public_html and is never copied into the frontend build.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $ok, string $message): never {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Use the enquiry form to send a message.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
    respond(413, false, 'Your message is too long. Please shorten it and try again.');
}
if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    respond(415, false, 'Please submit your enquiry using the website form.');
}

$configPath = getenv('SUVEC_MAIL_CONFIG') ?: dirname(__DIR__, 2) . '/suvec-mail-config.php';
$config = [];
if (is_file($configPath)) {
    try { $config = require $configPath; } catch (Throwable $error) {
        error_log('Suvec enquiry: mail configuration could not be loaded.');
        respond(503, false, 'Enquiry sending is temporarily unavailable. Please contact us directly.');
    }
}
if (!is_array($config)) $config = [];
$origins = $config['allowed_origins'] ?? ['https://suvec.org', 'https://www.suvec.org'];
if (!in_array($_SERVER['HTTP_ORIGIN'] ?? '', $origins, true)) {
    respond(403, false, 'Please submit your enquiry from the Suvec website.');
}

$raw = file_get_contents('php://input', false, null, 0, 20001);
if ($raw === false || strlen($raw) > 20000) respond(413, false, 'Your message is too long.');
try { $data = json_decode($raw, true, 32, JSON_THROW_ON_ERROR); }
catch (JsonException $error) { respond(400, false, 'Your enquiry could not be read. Please try again.'); }
if (!is_array($data)) respond(400, false, 'Please complete the enquiry form.');
if (!empty($data['website'])) respond(400, false, 'Your enquiry could not be accepted. Please contact us directly.');

$limits = ['kind'=>20, 'name'=>150, 'email'=>200, 'phone'=>40, 'company'=>150, 'service'=>150, 'collection'=>250, 'delivery'=>250, 'experience'=>250, 'message'=>5000];
$fields = [];
foreach ($limits as $key => $limit) {
    $value = $data[$key] ?? '';
    if (!is_string($value) || !preg_match('//u', $value)) respond(422, false, 'Please check the details in your enquiry.');
    $value = trim($value);
    $length = preg_match_all('/./us', $value);
    if ($length === false || $length > $limit || str_contains($value, "\0")) respond(422, false, 'Please shorten the details in your enquiry.');
    if ($key !== 'message' && preg_match('/[\r\n]/', $value)) respond(422, false, 'Please use a single line for contact details.');
    $fields[$key] = $value;
}
if (!in_array($fields['kind'], ['contact', 'quote', 'career'], true)) respond(422, false, 'Please choose a valid enquiry type.');
if ($fields['name'] === '' || $fields['message'] === '' || !filter_var($fields['email'], FILTER_VALIDATE_EMAIL) || ($data['consent'] ?? '') !== 'yes') {
    respond(422, false, 'Please enter your name, valid email address and message, and agree to share your details.');
}
if ($fields['kind'] === 'quote' && ($fields['collection'] === '' || $fields['delivery'] === '')) {
    respond(422, false, 'Please include your collection and delivery locations.');
}

foreach (['smtp_host', 'smtp_username', 'smtp_password'] as $required) {
    if (empty($config[$required]) || !is_string($config[$required])) {
        respond(503, false, 'Enquiry sending is not available yet. Please email info@suvec.org or call +260973828063.');
    }
}

// Reserve one attempt per request under a lock; only REMOTE_ADDR is trusted.
$rateDir = $config['rate_directory'] ?? sys_get_temp_dir() . '/suvec-enquiry-rate';
if (!is_dir($rateDir) && !@mkdir($rateDir, 0700, true) && !is_dir($rateDir)) {
    respond(503, false, 'We could not process your enquiry. Please contact us directly.');
}
$ratePath = $rateDir . '/' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|suvec.org') . '.json';
$rateFile = @fopen($ratePath, 'c+');
if (!$rateFile || !flock($rateFile, LOCK_EX)) respond(503, false, 'We could not process your enquiry. Please contact us directly.');
$attempts = json_decode(stream_get_contents($rateFile) ?: '[]', true);
$attempts = is_array($attempts) ? array_values(array_filter($attempts, fn($time) => is_int($time) && $time > time() - 3600)) : [];
if (count($attempts) >= 5) {
    flock($rateFile, LOCK_UN); fclose($rateFile);
    header('Retry-After: 3600');
    respond(429, false, 'Too many enquiries from this connection. Please try later or contact us directly.');
}
$attempts[] = time();
rewind($rateFile); ftruncate($rateFile, 0); fwrite($rateFile, json_encode($attempts)); fflush($rateFile);
flock($rateFile, LOCK_UN); fclose($rateFile);

require __DIR__ . '/lib/PHPMailer/src/Exception.php';
require __DIR__ . '/lib/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/src/SMTP.php';

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->Port = (int)($config['smtp_port'] ?? 465);
    $mail->SMTPSecure = $config['smtp_encryption'] ?? PHPMailer::ENCRYPTION_SMTPS;
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->Timeout = 20;
    $mail->getSMTPInstance()->Timelimit = 25;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['smtp_username'], 'Suvec Investments Limited');
    // The visitor can never control recipients, sender or arbitrary headers.
    $mail->addAddress('info@suvec.org', 'Suvec Investments Limited');
    $mail->addReplyTo($fields['email'], $fields['name']);
    $titles = ['contact'=>'Business enquiry', 'quote'=>'Transport quote enquiry', 'career'=>'Career interest'];
    $mail->Subject = 'Suvec website: ' . $titles[$fields['kind']];
    $lines = ['SUVEC INVESTMENTS LIMITED', $titles[$fields['kind']], ''];
    foreach (['name'=>'Name', 'email'=>'Email', 'phone'=>'Phone', 'company'=>'Company', 'service'=>'Service / Area of interest', 'collection'=>'Collection', 'delivery'=>'Delivery', 'experience'=>'Experience', 'message'=>'Message'] as $key=>$label) {
        if ($fields[$key] !== '') $lines[] = $label . ': ' . $fields[$key];
    }
    $mail->isHTML(false);
    $mail->Body = implode("\n", $lines);
    $mail->send();
    respond(200, true, 'Your enquiry has been sent to the Suvec team.');
} catch (Throwable $error) {
    // Do not expose SMTP credentials, transport errors or visitor data.
    error_log('Suvec enquiry: SMTP delivery was not accepted.');
    respond(502, false, 'We could not send your enquiry. Please email info@suvec.org or call +260973828063.');
}
