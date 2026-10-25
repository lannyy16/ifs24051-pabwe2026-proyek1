# HerbaNusantara — Frontend

React + Vite. Backend dipanggil lewat REST API (lihat `src/config/env.js`).

## Struktur `src/`

| Folder | Tanggung jawab |
| --- | --- |
| `config/` | Konfigurasi: base URL API (`env.js`) dan kunci storage |
| `services/` | Akses API: `api.js` (HTTP client), `authService.js`, `herbService.js` |
| `hooks/` | State & efek: `useAuth`, `useHerbs`, `usePageRouter`, `useSavedHerbs` |
| `pages/` | Halaman (komposisi UI) |
| `components/` | Komponen UI yang dipakai ulang |
| `data/` | Data statis (menu, artikel, topik, kategori) |
| `utils/` | Fungsi murni: routing, session storage, validasi/format |
| `styles/` | CSS per bagian, diimpor lewat `styles/index.css` |

Alur data: `pages/components` → `hooks` → `services` → `config`.
`App.jsx` hanya merangkai hook dan memilih halaman yang ditampilkan.

## Menjalankan

```bash
npm install
npm run dev
```

Secara bawaan frontend memakai backend produksi. Untuk backend lokal,
buat `frontend/.env.local`:

```
VITE_API_URL=http://localhost:3000/api
```

## Pengujian

Konfigurasi test ada di `vitest.config.js` pada root repository
(satu sumber konfigurasi). Jalankan dari root:

```bash
npm install
npm test
```

## Deploy Vercel

- Root directory: `frontend`; Framework: Vite; Build: `npm run build`; Output: `dist`.
- Opsional: set `VITE_API_URL` (termasuk `/api`, tanpa slash akhir), lalu redeploy.
