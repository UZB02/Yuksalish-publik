# Yuksalish Publik

Ochiq reyting ilovasi (Vue 3 + TypeScript + Tailwind CSS): hamma uchun, kirishsiz. Mustaqil loyiha: o'z `package.json` va `node_modules`. Backend: [../Yuksalish_backend](../Yuksalish_backend) (avval ishga tushiring, `http://localhost:4000`). Admin panel: [../Yuksalish_Front](../Yuksalish_Front).

```bash
npm install
npm run dev        # http://localhost:5174
```

Manzillar: `/` (maktablar), `/:slug` (maktab reytingi, `?tab=classes&grade=7&class=...&q=...` havolasi ulashiladi), `/global` (maktablar reytingi), `/:slug/tv` va `/global/tv` (TV/kiosk rejimi: F - to'liq ekran, Space - pauza, strelkalar - qo'lda, Esc - chiqish).

- `npm run dev` - http://localhost:5174 (`/api` -> http://localhost:4000)
- `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run format`
- `.env.example`: `VITE_API_BASE_URL=/api/v1`

Tuzilma: `src/api` (fetch wrapper, public API), `src/components/{ui,rating,tv,layout}`, `src/composables` (polling, URL holati, mavzu, brend rangi, TV pleyeri), `src/utils` (color, format, slides), `src/views`.
