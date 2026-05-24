# PIX QR Decoder

A Next.js microapp to decode **PIX BR Code** (EMV) payloads from QR images or **Copia e Cola** text. Deploy-ready for [Vercel](https://vercel.com).

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

Dehashed integration uses `/api/dehashed` with `DEHASHED_API_KEY` (v2 API). Clicks run a minimal API search (1 result) then open the Dehashed web UI with the same query. Supported PIX keys: CPF, CNPJ, email, and phone (not random EVP keys).

```bash
cp .env.example .env.local
# set DEHASHED_API_KEY=...
```
