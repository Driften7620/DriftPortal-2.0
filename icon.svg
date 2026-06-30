# Sprint 7.1 - Supabase opsætning

Denne guide forbinder DriftPortal 2.0 med en rigtig database, login og privat fillager.
Supabase Free kan bruges til den første driftstest.

## 1. Opret projektet

1. Gå til `https://supabase.com` og opret en gratis konto.
2. Vælg **New project**.
3. Navngiv projektet `DriftPortal-2.0`.
4. Vælg en stærk databaseadgangskode og gem den et sikkert sted.
5. Vælg en europæisk region.

## 2. Installer databasen

1. Åbn **SQL Editor** i Supabase.
2. Opret en ny forespørgsel.
3. Indsæt hele indholdet af `supabase/schema.sql` og kør det én gang.
4. Opret derefter en ny forespørgsel.
5. Indsæt hele indholdet af `supabase/seed.sql` og kør det.

Skemaet opretter tabeller, adgangsregler og private filområder til SDS, jobbilag og billeder.

## 3. Forbind GitHub Pages

Find disse to værdier under **Project Settings > API**:

- Project URL
- Public `anon` eller publishable key

Åbn GitHub-repositoriet og vælg:

1. **Settings**
2. **Secrets and variables**
3. **Actions**
4. **New repository secret**

Opret:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Den hemmelige `service_role`-nøgle må aldrig indsættes i GitHub Pages eller appens `.env`.

## 4. Indstil login-adresser

Åbn **Authentication > URL Configuration** i Supabase:

- Site URL: `https://driften7620.github.io/DriftPortal-2.0/`
- Redirect URL: `https://driften7620.github.io/DriftPortal-2.0/`

## 5. Opret første administrator

1. Åbn **Authentication > Users**.
2. Invitér din egen email.
3. Åbn **SQL Editor** og kør:

```sql
update public.profiles
set role = 'system_admin',
    module_access = array[
      'dashboard','maalerlog','rundering','facility-service','mine-opgaver',
      'lagerstyring','sds','hr','tid','how-to-do','liveconnect','udstyr',
      'el-eftersyn','koeretoejer','anlaeg','administration','vedligehold',
      'global-soegning'
    ]
where email = 'DIN-EMAIL-HER';
```

## 6. Aktivér sikker brugerinvitation

Serverfunktionen ligger i `supabase/functions/invite-user`.

Ved deployment skal funktionen have:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGIN=https://driften7620.github.io`

Supabase leverer de tre første værdier automatisk til en deployed Edge Function. Kun
`ALLOWED_ORIGIN` skal tilføjes som ekstra secret.

## 7. Kontrollér forbindelsen

1. Upload projektet til GitHub.
2. Vent på et grønt GitHub Actions-run.
3. Log ind i DriftPortal.
4. Åbn **Administration > System**.
5. Tryk **Test Supabase-forbindelse**.

Panelet viser, om nøgler, database og adgangsregler svarer korrekt.
