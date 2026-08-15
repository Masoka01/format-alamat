# Denah Formatter

Formatter alamat denah siap pakai untuk CorelDraw.  
Tech stack: **Vite · React 19 · TypeScript · Tailwind CSS**

## Cara jalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173

## Ganti background image

Buka `src/globals.css`, ubah variabel di bagian `:root`:

```css
:root {
  --bg-image: url('/images/background.jpg'); /* nama file gambar */
  --bg-size: cover;                          /* cover | contain | auto */
  --bg-position: center center;              /* posisi gambar */
  --bg-repeat: no-repeat;
  --bg-attachment: fixed;                   /* fixed = parallax */
  --bg-overlay-opacity: 0.45;               /* 0.0 - 1.0 */
  --bg-overlay-color: 0 0 0;               /* warna overlay R G B */
}
```

Taruh file gambar di `/public/images/` lalu sesuaikan nama di `--bg-image`.

## Build production

```bash
npm run build
npm run preview
```

## Struktur project

```
src/
├── main.tsx        ← entry point
├── App.tsx
├── globals.css     ← pengaturan background di sini
└── components/
    └── Formatter.tsx
public/
└── images/         ← taruh gambar background di sini
```
