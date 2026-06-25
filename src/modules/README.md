# Modules

Hvert DriftPortal-modul får sin egen mappe her, når funktionerne porteres fra den gamle app.

Eksempel:

- `maalerlog`
- `rundering`
- `facility-service`
- `lagerstyring`
- `sds`
- `hr`
- `tid`
- `udstyr`
- `el-eftersyn`

Målet er, at hvert modul samler egne komponenter, hooks, services og typer, mens fælles byggesten bliver liggende i `src/components`, `src/services` og `src/types`.
