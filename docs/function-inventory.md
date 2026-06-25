# DriftPortal 2.0 - Funktionsoversigt

Denne fil bruges som tjekliste, så eksisterende funktioner fra den nuværende app ikke forsvinder under porteringen fra single-file `index.html` til React/Vite.

Statusforklaring:

- `Reference fundet`: Funktionen findes i uploadet `index.html` og skal portes.
- `Skal bygges`: Funktionen er ønsket i DriftPortal 2.0, men findes ikke fuldt i den gamle app.
- `Sprint 0 skal`: Modulside findes i React-skallen, men logik er endnu ikke portet.

| Område | Status | Skal med i React-versionen |
| --- | --- | --- |
| Login og brugere | Reference fundet | Roller, adgangsstyring, brugerprofiler, skift bruger |
| Dashboard | Sprint 0 skal | Store modulkort, status, alarmer, hurtig navigation |
| Infoskærm | Reference fundet | TV-visning, driftsstatus, MålerLog, Lager, Rundering, Facility, Udstyr |
| MålerLog | Reference fundet | Aflæsning, QR, kamera, historik, forbrug, alarmer, eksport |
| Rundering | Reference fundet | Grupper, lokationer, aktiviteter, målepunkter, QR/NFC, undtagelser |
| Facility Service | Reference fundet | Jobs, tildeling, opgaver, checklister, vedhæftninger |
| Mine Opgaver | Reference fundet | Personlige opgaver, status og jobflow |
| Lagerstyring | Reference fundet | Beholdning, min/max, lagerlog, QR, indkøbsliste, lokationer |
| SDS | Reference fundet | Sikkerhedsdatablade, PDF, billeder, fareinfo, nødtelefon |
| HR bruger | Reference fundet | Arbejdstid, ferie/fri, saldo, kalender, ansøgninger |
| HR admin | Reference fundet | Godkendelser, brugerfilter, log, saldo, låsning, overførsler |
| Tid bruger | Reference fundet | Tidsregistrering, udkald og log |
| Tid admin | Reference fundet | Godkendelse, takster, oversigt og indstillinger |
| How To Do | Reference fundet | Manualer, filer, lokationer og QR |
| LiveConnect | Reference fundet | Eksternt driftsdashboard med fallback |
| Udstyr | Reference fundet | Udlån, reservation, returnering, billeder, godkendelsesstatus |
| El-eftersyn | Reference fundet | Eftersyn, fund, frister, CSV og alarmer |
| Administration | Reference fundet | Moduladgang, backup, QR-print, nulstilling og systemindstillinger |
| Global søgning | Skal bygges | Søg på tværs af målere, udstyr, SDS, jobs og manualer |
| Push-notifikationer | Skal bygges | Opgaver, alarmer, godkendelser og reminders |
| Synkronisering | Skal bygges | Offline kø og konflikt-håndtering mod Supabase |
| Køretøjer | Skal bygges | Service, syn, dæk, brændstof og kilometer |
| Anlæg | Skal bygges | Pumper, motorer, ventiler, vekslere, kedler, billeder og historik |
| Vedligeholdelsesplan | Skal bygges | Gentagne serviceopgaver og intervaller |
| Dokumentation | Skal bygges | Billedarkiv koblet til job, måler, lager, SDS og anlæg |

## Porteringsprincip

Hvert modul flyttes i tre trin:

1. Datamodel og Supabase-tabeller.
2. Services/hooks til læsning, skrivning, offline kø og aktivitetslog.
3. Material UI-komponenter og responsive sider.

Ingen gammel funktion fjernes uden at den enten er portet, erstattet af en bedre løsning eller markeret som bevidst fravalgt.
