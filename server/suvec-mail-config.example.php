<?php
// Copy to suvec-mail-config.php ABOVE public_html on the hosting account.
// Enter real values only there, never in Git, React or public_html.
return [
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 465,
    'smtp_encryption' => 'ssl',
    'smtp_username' => 'info@suvec.org',
    'smtp_password' => '',
    'allowed_origins' => ['https://suvec.org', 'https://www.suvec.org'],
];
