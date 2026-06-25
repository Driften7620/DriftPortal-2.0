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
2. Sprint 1 - login, roller, navigation, Supabase schema og app-shell. Status: i gang.
3. Sprint 2 - Dashboard og MålerLog.
4. Sprint 3 - Rundering som PlantLog-inspireret modul.
5. Sprint 4 - Facility Service og Mine opgaver.
6. Sprint 5 - Lagerstyring og SDS.
7. Sprint 6 - HR og Tid.
8. Sprint 7 - How To Do og LiveConnect.
9. Sprint 8 - Udstyr og El-eftersyn.
10. Sprint 9 - Køretøjer og Anlæg.
11. Sprint 10 - global søgning, rapporter, Excel/PDF, notifikationer og dokumentation.

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
