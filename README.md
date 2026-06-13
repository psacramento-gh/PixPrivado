# Pix Privacy Explorer

A Next.js microapp to explore **what Pix BR Code (EMV) payloads reveal**—from QR images or **Copia e Cola** text. Deploy-ready for [Vercel](https://vercel.com).

## Features

- Upload QR image (PNG, JPEG, WebP)
- Paste Copia e Cola EMV string
- Full nested TLV table with EN / PT-BR labels
- CRC16 validation
- Automatic fetch of dynamic QR **location** payloads (server-side proxy)
- Summary line for PIX QR codes
- Email breach lookups via [Have I Been Pwned](https://haveibeenpwned.com/) (HIBP API v3)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

```bash
npx vercel
```

All QR decoding runs in the browser. Location fetches use `/api/location` on the server to avoid CORS when loading cobrança JSON from PSP domains.

## HIBP API key

Email breach lookups call `GET /api/lookup` (and `POST /api/breach` for total checks), which read **`HIBP_API_KEY`** from the [HIBP API key page](https://haveibeenpwned.com/API/Key). A Core plan (1,000 requests/minute) is sufficient.

### Local development

Create a file that Next.js loads automatically (gitignored):

```bash
# /workspace/.env.local
HIBP_API_KEY=paste_your_32_char_hex_key_here
```

Restart the dev server after saving:

```bash
npm run dev
```

Quick check: decode a PIX QR with an email PIX key, click the value, and confirm breach results load in the lookup panel (no “HIBP_API_KEY is not available” in the network response).

### Vercel (production / preview)

**Dashboard (recommended)**

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **Pix Privacy Explorer** project.
2. **Settings** → **Environment Variables**.
3. Add:
   - **Key:** `HIBP_API_KEY`
   - **Value:** your 32-character hex API key (paste once; it is stored encrypted).
   - **Environments:** enable **Production**, **Preview**, and **Development** if you use Vercel’s cloud dev or preview deployments.
4. **Save**, then **Redeploy** the latest deployment (env vars apply on the next build/runtime, not retroactively to old instances in all cases).

**CLI** (from the repo root, after `vercel link`):

```bash
npx vercel env add HIBP_API_KEY production
npx vercel env add HIBP_API_KEY preview
npx vercel env add HIBP_API_KEY development
```

Paste the key when prompted. Redeploy with `npx vercel --prod` or push to the connected Git branch.

**Pull Vercel env into local** (optional, overwrites/merges into `.env.local`):

```bash
npx vercel link
npx vercel env pull .env.local
```

Never commit `.env.local` or paste the API key into Git, issues, or chat logs.

## CPF and Portal da Transparência

CPF values (PIX keys, partner fields, and masked socio CPF candidates) open **Portal da Transparência** search links on [portaldatransparencia.gov.br](https://portaldatransparencia.gov.br). Breach searches use HIBP for **email only**.
