# Pix Privacy Explorer

A Next.js microapp to explore **what Pix BR Code (EMV) payloads reveal**—from QR images or **Copia e Cola** text. Deploy-ready for [Vercel](https://vercel.com).

## Features

- Upload QR image (PNG, JPEG, WebP)
- Paste Copia e Cola EMV string
- Full nested TLV table with EN / PT-BR labels
- CRC16 validation
- Automatic fetch of dynamic QR **location** payloads (server-side proxy)
- Summary line for PIX QR codes

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

## Dehashed API key

Dehashed search links call `POST /api/dehashed`, which reads **`DEHASHED_API_KEY`** (v2 key from the [Dehashed dashboard](https://app.dehashed.com/)). Refresh the key once if you still use a legacy token.

### Local development

Create a file that Next.js loads automatically (gitignored):

```bash
# /workspace/.env.local
DEHASHED_API_KEY=paste_your_v2_api_key_here
```

Restart the dev server after saving:

```bash
npm run dev
```

Quick check: decode a PIX QR with a linked field, click the value, and confirm a new tab opens (no “Dehashed API is not configured” in the network response).

### Vercel (production / preview)

**Dashboard (recommended)**

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **Pix Privacy Explorer** project.
2. **Settings** → **Environment Variables**.
3. Add:
   - **Key:** `DEHASHED_API_KEY`
   - **Value:** your v2 API key (paste once; it is stored encrypted).
   - **Environments:** enable **Production**, **Preview**, and **Development** if you use Vercel’s cloud dev or preview deployments.
4. **Save**, then **Redeploy** the latest deployment (env vars apply on the next build/runtime, not retroactively to old instances in all cases).

**CLI** (from the repo root, after `vercel link`):

```bash
npx vercel env add DEHASHED_API_KEY production
npx vercel env add DEHASHED_API_KEY preview
npx vercel env add DEHASHED_API_KEY development
```

Paste the key when prompted. Redeploy with `npx vercel --prod` or push to the connected Git branch.

**Pull Vercel env into local** (optional, overwrites/merges into `.env.local`):

```bash
npx vercel link
npx vercel env pull .env.local
```

Never commit `.env.local` or paste the API key into Git, issues, or chat logs.

## CPFHub API key

CPF lookups (11-digit CPF from PIX keys or registry fields) use **`CPFHUB_API_KEY`** from [app.cpfhub.io](https://app.cpfhub.io). Breach searches use DeHashed for **email only** (phone numbers are not sent to the DeHashed API).

Add to `.env.local`:

```bash
CPFHUB_API_KEY=paste_your_cpfhub_api_key_here
```

On Vercel, add `CPFHUB_API_KEY` for **Preview** and **Production**, then redeploy. CPF results load at `/cpf/search` via a server-side fetch (`cache: no-store`); the key never reaches the browser.
