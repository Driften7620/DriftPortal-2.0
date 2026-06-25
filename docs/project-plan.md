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
4. Sprint 3 - MålerLog. Status: i gang.
5. Sprint 4 - Rundering som PlantLog-inspireret modul.
6. Sprint 5 - Facility Service og Mine opgaver.
7. Sprint 6 - Lagerstyring og SDS.
8. Sprint 7 - HR og Tid.
9. Sprint 8 - How To Do og LiveConnect.
10. Sprint 9 - Udstyr og El-eftersyn.
11. Sprint 10 - Køretøjer, Anlæg, global søgning, rapporter, Excel/PDF, notifikationer og dokumentation.

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
- Advarsel hvis ny aflæsning er lavere end seneste, uden for grænseværdi eller mere end 10x normalt forbrug.
- Historik pr. måler.
- QR- og kamera-knapper forberedt til næste integration.
- Supabase-tabeller for `meters` og `meter_readings` tilføjet i `supabase/schema.sql`.

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
