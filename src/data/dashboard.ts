export interface DashboardAlert {
  id: string;
  title: string;
  moduleId: string;
  moduleName: string;
  severity: 'critical' | 'warning' | 'info';
  detail: string;
  time: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  owner: string;
  moduleId: string;
  due: string;
  status: 'open' | 'waiting' | 'done';
}

export interface DashboardSignal {
  label: string;
  value: string;
  helper: string;
  tone: string;
}

export const dashboardAlerts: DashboardAlert[] = [
  {
    id: 'meter-readings',
    title: '39 måleraflæsninger afventer',
    moduleId: 'maalerlog',
    moduleName: 'MålerLog',
    severity: 'critical',
    detail: 'Vestavej har flest manglende aflæsninger.',
    time: 'Nu',
  },
  {
    id: 'rounding',
    title: '5 runderinger er ikke gennemført',
    moduleId: 'rundering',
    moduleName: 'Rundering',
    severity: 'warning',
    detail: 'Daglig kontrol mangler på kritiske lokationer.',
    time: 'I dag',
  },
  {
    id: 'inspection',
    title: '1 udstyr kræver el-eftersyn',
    moduleId: 'el-eftersyn',
    moduleName: 'El-eftersyn',
    severity: 'warning',
    detail: 'Eftersyn skal planlægges før udstyret frigives.',
    time: '3 dage',
  },
  {
    id: 'hr',
    title: '1 HR-ansøgning afventer',
    moduleId: 'hr',
    moduleName: 'HR',
    severity: 'info',
    detail: 'Ferie/fri skal godkendes af HR-admin.',
    time: 'I dag',
  },
];

export const dashboardTasks: DashboardTask[] = [
  {
    id: 'task-1',
    title: 'Aflæs biogas GE 620',
    owner: 'Drift',
    moduleId: 'maalerlog',
    due: '08:30',
    status: 'open',
  },
  {
    id: 'task-2',
    title: 'Kontroller lagerbeholdning kemikalier',
    owner: 'Stefan',
    moduleId: 'lagerstyring',
    due: '10:00',
    status: 'waiting',
  },
  {
    id: 'task-3',
    title: 'Gennemgå dagens facility-opgaver',
    owner: 'Allan',
    moduleId: 'facility-service',
    due: '12:00',
    status: 'open',
  },
  {
    id: 'task-4',
    title: 'Tjek ferie-/fraværskalender',
    owner: 'HR',
    moduleId: 'hr',
    due: '14:00',
    status: 'open',
  },
];

export const dashboardSignals: DashboardSignal[] = [
  { label: 'Vejret i Lemvig', value: '18°', helper: 'Klart vejr · 14° til 22°', tone: '#38bdf8' },
  { label: 'Elpris DK1', value: '43 øre/kWh', helper: 'I dag: 27 til 269 øre/kWh', tone: '#6ddc6d' },
  { label: 'Online status', value: 'Aktiv', helper: 'PWA og offline-cache klar', tone: '#00e5ff' },
];
