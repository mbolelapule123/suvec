# Enquiry delivery on suvec.org

The React forms now POST JSON to `/api/enquiry.php`. The endpoint uses PHPMailer 7.1.1 over authenticated SMTP and sends only to `info@suvec.org`, with the visitor's email as Reply-To. The browser reports success only after SMTP accepts the message. Recipient inbox delivery still depends on the mail provider.

## Hostinger/shared PHP hosting

The live site responds with Hostinger CDN headers. Confirm the hosting account supports PHP 8.1+ before deploying this endpoint.

1. Run `npm ci`, then `npm run build:hostinger`.
2. Upload the contents of `deployment/hostinger/public_html/` into the domain's `public_html/` directory. This includes the compiled frontend and `api/enquiry.php` with its PHPMailer library.
3. Copy `server/suvec-mail-config.example.php` to **`suvec-mail-config.php` one directory above `public_html`**. Never upload the real configuration inside `public_html`, add it to Git, or place mailbox credentials in React/Vite variables.
4. Enter the sending mailbox's SMTP host, port, encryption, username and password in that private file. For Hostinger Email, the normal settings are `smtp.hostinger.com`, port `465`, encryption `ssl`, and the full mailbox address. Use the actual provider's settings if the domain uses another email service. Port `587` uses encryption `tls`.
5. Confirm `info@suvec.org` exists and that its SPF/DKIM records are configured with the email provider.
6. Submit an authorised test enquiry from `https://suvec.org/contact/`. Check the response and both inbox and spam. Verify that replying addresses the visitor. No live test messages were sent during development.

The endpoint reads the private file on each request; no frontend rebuild is needed after changing SMTP credentials. An alternative private file location can be supplied through the server environment variable `SUVEC_MAIL_CONFIG`.

## Files and runtime

- `server/php/enquiry.php`: JSON endpoint with server validation, a honeypot, an origin allowlist, fixed email recipient and five attempts per IP per hour.
- `server/php/lib/PHPMailer/`: pinned upstream SMTP library and its licence, so Composer is not required on the host.
- `server/suvec-mail-config.example.php`: configuration template containing no password.
- `src/enquiry.tsx`: shared contact, transport quote and career-interest form.

Missing configuration returns HTTP 503. SMTP rejection returns 502. Neither is displayed as success, and entered details remain available for correction or direct contact. A request timeout does not automatically retry because delivery may already have occurred.

The standard `npm run build` produces static assets only. It deliberately excludes PHP and private configuration. The private ChatGPT Sites preview cannot execute this PHP endpoint. Use `build:hostinger` for the suvec.org deployment. A GitHub source push alone does not configure SMTP or install the endpoint on the domain unless its hosting pipeline performs these steps.

## Verification

```sh
php -l server/php/enquiry.php
npm run test:enquiry
```

Requires PHP 8.1+ on PATH, or set `PHP_BINARY` to its executable. The test runs a temporary PHP server and a local SMTP sink. It checks validation, unconfigured state, SMTP acceptance and rejection, recipient and Reply-To headers, and rate limits without sending mail externally. Tests use localhost ports 8088 and an ephemeral SMTP port.

Provider references: [Hostinger SMTP settings](https://support.hostinger.com/en/articles/1575756-how-to-get-email-account-configuration-details-for-hostinger-email), [Hostinger SMTP recommendation](https://support.hostinger.com/en/articles/11393648-php-mail-limitation-explained-how-to-improve-email-delivery-with-smtp), [PHPMailer](https://github.com/PHPMailer/PHPMailer/tree/v7.1.1).
