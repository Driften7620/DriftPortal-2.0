# DriftPortal 2.0 - Projektplan

## Vigtig beslutning

Alle nuvaerende funktioner fra den gamle `index.html` skal bevares eller bevidst erstattes. Den nye React-app er ikke en blank start funktionsmaessigt; den er en kontrolleret portering til en moderne, modulopbygget kodebase.

## Eksisterende funktioner fundet i upload

- Dashboard / infoskærm med driftsstatus
- MålerLog med aflæsning, QR, kamera, historik og alarmer
- Rundering med grupper, lokationer, aktiviteter, målepunkter og undtagelser
- Facility Service og Mine opgaver
- Lagerstyring med lokationer, beholdning, log og alarmer
- SDS med PDF, billeder, fareinfo og nødtelefon
- HR med arbejdstid, ferie/fri, saldo, kalender, HR-admin og log
- Tid med timer, udkald, manuel registrering, godkendelse og admin
- How To Do med manualer og filer
- LiveConnect
- Udstyr med udlån, reservationer, returnering og godkendelse
- El-eftersyn
- Administration, brugere, roller, backup, QR print og global aktivitetslog

## Sprintplan

1. Sprint 0 - fundament: Vite, React, TypeScript, MUI, router, PWA, CI, modulskal. Status: færdig.
2. Sprint 1 - login, roller, navigation, Supabase schema og app-shell. Status: færdig som fundament.
3. Sprint 2 - Dashboard og første driftsoversigt. Status: færdig som mock-data dashboard.
4. Sprint 3 - MålerLog. Status: færdig som offline/synk-grundlag.
5. Sprint 4 - Rundering som PlantLog-inspireret modul. Status: færdig som offline/synk-grundlag.
6. Sprint 5 - Facility Service og Mine opgaver. Status: færdig som offline/synk-grundlag.
7. Sprint 6 - Lagerstyring og SDS. Status: færdig som offline/synk-grundlag.
8. Sprint 7 - Administration og systemopsætning. Status: færdig som offline/synk-grundlag.
9. Sprint 7.1 - Supabase, server og sikker filhåndtering. Status: teknisk grundlag færdigt; projektoprettelse mangler.
10. Sprint 8 - HR og Tid. Status: færdig som offline/synk-grundlag.
11. Sprint 9 - How To Do og LiveConnect.
12. Sprint 10 - Udstyr og El-eftersyn.
13. Sprint 11 - Køretøjer, Anlæg, global søgning, rapporter, Excel/PDF, notifikationer og dokumentation.

## Sprint 2 leverance

- Dashboard med driftshero, online-status og hurtig handling til QR/søgning.
- Nøgletal for manglende måleraflæsninger, runderinger, lave lagervarer og HR-ansøgninger.
- Prioriterede hændelser med direkte link til relevante moduler.
- Dagens opgaver med frister og modullinks.
- Sprintstatus og prioriterede modulkort.
- Mock-data samlet i `src/data/dashboard.ts`, så de senere kan skiftes ud med Supabase-data.

## Sprint 3 leverance

- MålerLog som første rigtige modulside.
- Målerliste med lokationsfilter, status og seneste aflæsning.
- Registrer ny aflæsning med beregnet forbrug.
- Aflæsninger gemmes lokalt med det samme, så modulet kan bruges offline.
- Synk-status pr. aflæsning: afventer, synket eller fejlet.
- Synk-knap forberedt til Supabase, når rigtig login og miljøvariabler er sat op.
- Advarsel hvis ny aflæsning er lavere end seneste, uden for grænseværdi eller mere end 10x normalt forbrug.
- Historik pr. måler.
- QR- og kamera-knapper forberedt til næste integration.
- Supabase-tabeller for `meters` og `meter_readings` tilføjet i `supabase/schema.sql`.

## Sprint 4 leverance

- Rundering som rigtig modulside med runder, områder og kontrolpunkter.
- Store mobilvenlige handlinger til OK, afvigelse og spring over.
- Lokale registreringer gemmes på enheden og får synk-status.
- Seneste registreringer vises pr. runde.
- QR-knap forberedt til punkt-scanning.
- Supabase-tabeller for `round_points`, `round_sessions` og `round_checks` tilføjet i `supabase/schema.sql`.

## Sprint 5 leverance

- Facility Service med samlet jobliste, søgning, statusfilter og nøgletal.
- Opret opgaver med lokation, kategori, prioritet, ansvarlig og frist.
- Checklister, kommentarer, bilagstæller og materialeforbrug på hvert job.
- Mine Opgaver med personligt filter og hurtige handlinger til start, pause og afslut.
- Facility Service og Mine Opgaver deler samme lokale data og virker offline.
- Synk-status og rigtig Supabase-upsert, når login og miljøvariabler er konfigureret.
- Supabase-tabellen `facility_work_orders` med RLS-politikker.

## Sprint 6 leverance

- Lagerstyring med søgning, lokations- og kategorifilter samt tydelig min./maks.-status.
- Lagerbevægelser registrerer antal, årsag, bruger og tidspunkt og gemmes straks offline.
- Nye lagervarer kan oprettes med kategori, lokation, enhed og beholdningsgrænser.
- Afventende lagervarer og bevægelser kan synkroniseres til Supabase.
- SDS-bibliotek med søgning på kemikalie, leverandør, H-kode, lokation og signalord.
- Kemikaliedetaljer med farer, værnemidler, førstehjælp, nødtelefon og revisionsdato.
- Favoritter og senest viste sikkerhedsdatablade gemmes lokalt.
- PDF- og QR-felter er forberedt til Supabase Storage og scannerintegration.
- Supabase-tabellerne `inventory_items`, `inventory_movements` og `sds_documents` med RLS-politikker.

## Sprint 7 leverance

- Samlet administrationsmodul med faner til oversigt, brugere, struktur og system.
- Brugerliste med søgning, rollefilter, aktiv/deaktiveret status og redigering.
- Rollevalg med standardadgang og individuel moduladgang pr. bruger.
- Oprettelse af nye brugere lokalt med klargøring til Supabase-invitation.
- Fælles lokationer med kode, adresse og aktiv status.
- Fælles kategorier med anvendelsesområde, farve og aktiv status.
- Systemindstillinger for organisationsnavn, nødtelefon og standardlokation.
- Indstillinger for automatisk synk, offline-funktioner, push og synkinterval.
- Offline-gem og samlet synkstatus for hele systemopsætningen.
- Supabase-tabellerne `system_locations`, `system_categories` og `portal_settings`.
- Administratorpolitikker til opdatering af profiler og systemopsætning.

## Sprint 7.1 leverance

- Validering af Supabase URL og offentlig nøgle, før klienten startes.
- Forbindelsespanel under Administration > System med databasekontrol.
- GitHub Actions læser Supabase-værdier sikkert fra repository secrets.
- Supabase-konfiguration til lokal udvikling, Auth, Storage og Edge Functions.
- Seed-data til lokationer, kategorier og globale portalindstillinger.
- Private Storage-buckets til SDS, jobbilag og udstyrsbilleder.
- RLS-politikker til visning, upload, opdatering og sletning af filer.
- Sikker Edge Function til brugerinvitation, som kun kan kaldes af administratorer.
- Nye lokale brugere sendes som invitationer ved rigtig Supabase-synk.
- Trinvis opsætningsguide i `docs/supabase-setup.md`.
- Rigtig login opdaterer sessionen direkte uden forkert redirect fra GitHub Pages.

## Sprint 7.3 leverance

- Administration henter brugere, lokationer, kategorier og globale indstillinger fra Supabase.
- Lokale, afventende ændringer bevares, når nyere serverdata indlæses.
- Synkronisering kan ikke startes flere gange samtidig og viser tydelig arbejdsstatus.
- Et nyt tryk på Synk henter ændringer fra andre enheder, når den lokale kø er tom.
- Brugerinvitationer kan gentages sikkert, hvis brugeren allerede blev oprettet ved et tidligere forsøg.
- Synkronisering registreres i aktivitetsloggen med antal ændrede poster.
- Seneste kontakt med Supabase vises i administrationsmodulet.

## Sprint 8 leverance

- HR-oversigt med ferie, flekssaldo, afventende arbejdstid og ansøgninger.
- Registrering af arbejdsdage med automatisk beregning af timer og pauser.
- Ansøgning om ferie, feriefridage, omsorgsdage og fri uden løn.
- HR Admin kan godkende eller afvise registreringer med kommentar.
- HR Admin kan redigere ferie-, fleks-, fridags- og omsorgsdagssaldi.
- Tidsregistrering med ordinær tid, overarbejde, udkald, kørsel og kursus.
- Udkaldstimer udfylder automatisk start og slut i en ny registrering.
- Afventende tidsregistreringer kan redigeres; behandlede registreringer låses.
- Tid Admin kan godkende, afvise, lukke perioder og eksportere timer til CSV/Excel.
- HR og Tid gemmer lokalt med det samme og synkroniserer til Supabase.
- Supabase-tabeller og RLS-politikker til egne data samt HR/Tid-administratorer.

## Nye moduler fra brief

- Køretøjer: service, syn, dæk, brændstof og kilometer.
- Anlæg: pumper, motorer, ventiler, vekslere, kedler, billeder og historik.
- Vedligeholdelsesplan: gentagne serviceintervaller.
- Dokumentation: billedarkiv koblet til jobs, målere, lager, SDS og anlæg.

## Arkitektur

- `src/app`: app bootstrap og tema
- `src/layouts`: topbar, navigation og shell
- `src/pages`: ruter og modul-sider
- `src/components`: genbrugelige komponenter
- `src/data`: midlertidig mock-data
- `src/services`: Supabase/API-lag
- `src/hooks`: centraliseret React-logik
- `src/types`: fælles typer
