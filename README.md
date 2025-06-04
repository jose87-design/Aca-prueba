# Academia Recruitment – Full Stack

Este repositorio contiene **frontend** (React + Vite + Tailwind) y **backend** (Express) listos para correr
en local y desplegar.

## Requisitos globales

- Node.js ≥ 22.x
- `corepack enable` (para tener pnpm ≥ 9)
- Git (opcional, si vas a versionar)

> Generado automáticamente el 2025-06-04 21:24:37 UTC.

---

## Pasos rápidos

1. **Clona o descomprime** este proyecto:
```bash
unzip academia-app.zip
cd academia-app
```

2. **Backend**
```bash
cd backend
pnpm install
cp .env.example .env    # rellena si usarás APIs reales
pnpm run dev            # http://localhost:3000/api/health
```

3. **Frontend**
```bash
cd ../frontend
pnpm install
cp .env.example .env    # VITE_API_BASE_URL ya apunta a :3000
pnpm run dev            # http://localhost:5173
```

4. Abre el navegador en <http://localhost:5173> y verás la lista de candidatos servida por el backend.

---

## Construir y desplegar

- **Frontend:** `pnpm run build` genera `/dist`, ideal para Vercel, Netlify o servir con nginx.
- **Backend:** Puedes desplegar en Render, Railway, Fly.io, etc. Asegúrate de exponer `PORT`.

---

## Customización

- Sustituye la función `fetchMockCandidates()` (backend) por integraciones reales con InfoJobs, LinkedIn, etc.
- Añade rutas nuevas en Express y componentes en React según lo necesites.

¡Éxitos con tu proyecto! 🚀
