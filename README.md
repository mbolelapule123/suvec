# Suvec Investments Limited

Responsive logistics website built with React, TypeScript, Vite and Node.js tooling. Uses the supplied Suvec brand and transport images.

## Development

Requires a current Node.js installation and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally http://localhost:5173.

## Production

```sh
npm run build
npm run preview
```

Deploy the `dist` directory to a static host. The build generates individual entry points for `/about`, `/services`, `/fleet`, `/routes`, `/careers` and `/contact`, as well as the home page and a 404 page. Assets use root-relative URLs; deploy at the domain root.

## Pages and interactions

- Shared desktop and mobile navigation with current-page indication.
- About Us: business introduction, values and industries.
- Our Services: service selector, service details and expandable FAQs.
- Our Fleet: capability filters and transport enquiry links.
- Routes: destination search and selectable regional route details.
- Careers: areas of interest and a career-interest submission form.
- Contact: location information and an enquiry submission form.
- Quote dialog available throughout the website.

Forms submit to a server-side SMTP endpoint and show success only after the mail server accepts the message. For suvec.org, run `npm run build:hostinger` and follow [the server deployment instructions](server/DEPLOYMENT.md) to install the PHP endpoint and configure the mailbox securely. The static ChatGPT Sites preview does not execute PHP. Contact details are centralised in `src/contact.ts`. Careers content describes areas of interest rather than confirmed vacancies. Equipment availability and route arrangements require confirmation for each shipment.

Source lives in `src/`; supplied assets live in `public/`. The tracked `.openai/hosting.json` preserves the existing private Sites deployment identity. No deployment credentials are stored in source.
