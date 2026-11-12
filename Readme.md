# Lost&Found UEx

Monolito JavaScript: backend Express, frontend React y PostgreSQL. Implementación actual: registro local US-001 (SCRUM-83), según el diseño SCRUM-85.

La [guía del registro](docs/development/US-001-registro.md) explica instalación, configuración, estructura, contrato API y pruebas para SCRUM-84.

Inicio rápido con Node.js 22.12+ y Docker Desktop activo:

```powershell
npm.cmd ci
Copy-Item .env.example .env
docker compose up -d --wait db
npm.cmd run db:migrate
npm.cmd run dev
```

Si `.env` ya existe, conservarlo y revisar sus valores. Usar únicamente datos ficticios. Para ejecutar el monolito compilado: `npm.cmd run build` y `npm.cmd start`.

Pruebas: `npm.cmd test` (API y React), `npm.cmd run test:db` (PostgreSQL real independiente), `npm.cmd run test:monolith` (arranque compilado, archivos React y registro HTTP).
