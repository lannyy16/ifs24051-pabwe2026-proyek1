# HerbaNusantara Frontend

## Lokal
1. `npm install`
2. Jalankan backend di port 3000.
3. `npm run dev`

Vite meneruskan `/api` ke `http://localhost:3000` selama development.

## Deploy Vercel
- Import folder/repository frontend.
- Framework: Vite; Build command: `npm run build`; Output: `dist`.
- Tambahkan environment variable `VITE_API_URL` berisi URL publik backend, misalnya `https://herbanusantara-api.onrender.com` (tanpa slash terakhir).
- Redeploy setelah menambahkan environment variable.
