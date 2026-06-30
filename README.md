# DriftPortal 2.0

Professionel PWA til drift og vedligeholdelse af et fjernvarmevaerk.

## Stack

- React 19
- Vite
- TypeScript
- Material UI
- React Router
- Supabase
- PWA / offline cache
- ESLint + Prettier
- GitHub Actions

## Udviklingsmodel

Projektet bygges sprint for sprint. Den uploadede `work/uploaded-files/index.html` er reference for eksisterende funktioner, saerligt HR, Tid, MaalerLog, Lagerstyring, Rundering, SDS, Facility Service, Udstyr og El-eftersyn.

## Kommandoer

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## Miljoevariabler

Kopier `.env.example` til `.env.local` og indsæt Supabase URL + anon key.

Den komplette guide til database, login, Storage og GitHub Secrets findes i
`docs/supabase-setup.md`.

## Sprint 1

Sprint 1 introducerer:

- Supabase-klient
- login-side med demo-admin
- rollemodel og moduladgang
- beskyttede ruter
- database-startskema i `supabase/schema.sql`
