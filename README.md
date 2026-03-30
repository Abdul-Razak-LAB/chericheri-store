This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contact Form Setup

The contact page submits to `POST /api/contact`.

Add these environment variables in your `.env.local` file:

```bash
# Database (optional but recommended - saves inquiries)
MONGODB_URI=your_mongodb_connection_string

# SMTP (required for email delivery)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@yourdomain.com

# Optional recipient override (defaults to SMTP_USER)
CONTACT_RECEIVER_EMAIL=you@yourdomain.com
```

Important:

- Do not wrap env values in quotes. Use `MONGODB_URI=...` not `MONGODB_URI='...'`.

Behavior:

- If MongoDB is configured, inquiries are saved in `contact_inquiry`.
- If SMTP is configured, inquiry emails are delivered to `CONTACT_RECEIVER_EMAIL`.
- If both are configured, both actions run.
- If both DB and SMTP fail at runtime, inquiry is queued locally in `data/contact-inquiries.json`.

### Contact Diagnostics Endpoint

Use this endpoint to check contact setup without exposing secrets:

- `GET /api/contact/status` : configuration check only
- `GET /api/contact/status?check=1` : includes live MongoDB and SMTP connectivity checks

Optional security token:

```bash
CONTACT_DEBUG_TOKEN=your_private_token
```

If `CONTACT_DEBUG_TOKEN` is set, provide it with either:

- Header: `x-contact-debug-token: your_private_token`
- Query: `?token=your_private_token`

## Currency Setup

You can use either Ghana Cedi or US Dollar across the store:

```bash
# Supported values: GHS or USD
NEXT_PUBLIC_CURRENCY=GHS

# Conversion rate used when showing Ghana Cedi prices
# Example: 1 USD = 15 GHS
NEXT_PUBLIC_USD_TO_GHS=15
```

Notes:

- The navbar has a currency selector (GHS/USD).
- The selected currency is saved in local storage and applied app-wide.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# chericheri-store
