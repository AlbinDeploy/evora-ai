# Evora AI

Evora AI adalah aplikasi web full-stack berbasis Next.js yang fokus pada chat AI, coding assistant, analisis file, dan generate file dengan UI clean dan premium feel.

## Fitur utama
- Landing page clean dan responsive
- Register, login, verifikasi email real via Resend
- Forgot password / reset password via email
- Gemini API dengan support multi API key fallback / rotation
- Chat streaming
- Upload gambar, txt, md, json, pdf
- Analisis file upload dan kirim konteks ke Gemini
- Generate file `.txt`, `.md`, `.json`, `.pdf`
- Neon PostgreSQL + Drizzle ORM + migration SQL
- Middleware security headers + validasi input + rate limit dasar

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Neon PostgreSQL
- Drizzle ORM
- Gemini API
- Resend

## Setup lokal
1. Install dependency
```bash
npm install
```

2. Copy env
```bash
cp .env.example .env.local
```

3. Isi semua env yang dibutuhkan.

4. Jalankan migration ke Neon
```bash
npm run db:migrate
```

5. Jalankan app
```bash
npm run dev
```

## Deploy ke Vercel
1. Push project ke GitHub.
2. Import repository ke Vercel.
3. Tambahkan semua environment variable dari `.env.example` ke Vercel.
4. Set `DATABASE_URL` dari Neon.
5. Deploy.
6. Setelah deploy, jalankan migration sekali dari local machine atau CI:
```bash
npm run db:migrate
```

## Catatan email verification gratis
Gunakan Resend free tier. Untuk production, domain pengirim harus terverifikasi.

## Catatan upload
Project ini menyimpan isi file kecil ke database agar tetap jalan di stack gratisan. Untuk scale lebih besar, pindahkan file storage ke object storage seperti Vercel Blob / S3 compatible storage.

## Catatan keamanan
- JWT disimpan di HTTP-only cookie
- Password di-hash dengan bcrypt
- Ada rate limiting in-memory dasar
- MIME type upload dibatasi
- Secret tetap server-only

## Struktur ringkas
- `app/` UI dan route handlers
- `components/` komponen reusable
- `db/` schema dan migrasi
- `lib/` auth, gemini, email, helper
- `middleware.ts` security headers
