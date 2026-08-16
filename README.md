# Denah Formatter

Formatter alamat denah siap pakai untuk CorelDraw.  
Tech stack: **Vite · React 19 · TypeScript · Tailwind CSS**

## Cara jalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173

## Ganti background video

- **Video:** taruh file di `/public/video/`, lalu ubah `src` di `src/App.tsx` (mis. `/video/cok.webm`).
- **Poster + foto fallback** (tampil sebelum video termuat / saat area tak tertutup video): taruh di `/public/images/`, lalu ubah `--bg-image` di `src/globals.css` (`:root`).

```css
:root {
  --bg-image: url('/images/cok.webp'); /* poster + fallback */
  --bg-overlay-opacity: 0;             /* 0.0 - 1.0 — 0 = background apa adanya */
}
```

Perilaku tampilan (di `src/globals.css`, `.bg-video`):

- **Landscape (desktop):** `contain` + zoom 1.1 → adegan ~91%, tanpa bar.
- **Portrait (HP):** `cover` penuh layar + `object-position: 75% center` (menampilkan sisi kanan-tengah adegan).

## Build production

```bash
npm run build
npm run preview
```

## Deploy ke Firebase Hosting

```bash
npm run build && firebase deploy --only hosting
```

Live: **https://shodirintextformatter.web.app** (project `shodirintextformatter`, lihat `.firebaserc`)

Konfigurasi cache (`firebase.json`):

- Assets (`js|css`) & media (`webm|webp|svg`) → `public, max-age=31536000, immutable` (1 tahun).
- `index.html` dan `/` → `no-cache` (selalu revalidasi → update UI langsung kena).

**Penting — saat mengganti video/poster:** karena media di-cache immutable setahun, WAJIB rename nama file (mis. `cok-v2.webm`) dan update referensinya di `src/App.tsx` / `--bg-image`. File bernama sama tidak akan diminta ulang browser.

## Struktur project

```
src/
├── main.tsx        ← entry point
├── App.tsx         ← video background (src /video/...)
├── globals.css     ← pengaturan background & veil di sini
└── components/
    └── Formatter.tsx
public/
├── images/         ← poster + fallback foto
└── video/          ← video background
firebase.json       ← hosting: cache immutable + SPA rewrite
```
