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
- Careers: areas of interest and a downloadable career introduction.
- Contact: location information and a downloadable business enquiry.
- Quote dialog available throughout the website.

Forms validate in the browser and download a text copy. They do not submit or store enquiries remotely. Business phone, email, street address and any form submission service must be supplied before adding direct contact or delivery functionality. Careers content describes areas of interest rather than confirmed vacancies. Equipment availability and route arrangements require confirmation for each shipment.

Source lives in `src/`; supplied assets live in `public/`. The tracked `.openai/hosting.json` preserves the existing private Sites deployment identity. No deployment credentials are stored in source.
