import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BoltIcon from '@mui/icons-material/Bolt';
import BuildIcon from '@mui/icons-material/Build';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FactoryIcon from '@mui/icons-material/Factory';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TimerIcon from '@mui/icons-material/Timer';

import type { DriftModule } from '../types/navigation';

export const driftModules: DriftModule[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Driftsstatus, alarmer og hurtig navigation',
    accent: '#00e5ff',
    icon: DashboardIcon,
    status: 'ok',
    sprint: 'Sprint 1',
    legacyCoverage: ['Infoskærm', 'statuskort', 'hurtig adgang', 'kritiske alarmer'],
  },
  {
    id: 'maalerlog',
    title: 'MålerLog',
    description: 'Aflæs målere, forbrug og grænsealarmer',
    accent: '#00e5ff',
    icon: BoltIcon,
    status: 'critical',
    badge: '39 afventer',
    sprint: 'Sprint 2',
    legacyCoverage: ['måleraflæsninger', 'QR', 'kamera', 'alarm-mails', 'historik'],
  },
  {
    id: 'rundering',
    title: 'Rundering',
    description: 'PlantLog-inspirerede logs, aktiviteter og målepunkter',
    accent: '#a78bfa',
    icon: SearchIcon,
    status: 'warning',
    badge: '5 ikke runderet',
    sprint: 'Sprint 3',
    legacyCoverage: ['grupper', 'lokationer', 'aktiviteter', 'QR/NFC', 'undtagelser'],
  },
  {
    id: 'facility-service',
    title: 'Facility Service',
    description: 'Opgaver, vedligehold og materialeforbrug',
    accent: '#fb923c',
    icon: BuildIcon,
    status: 'ok',
    sprint: 'Sprint 4',
    legacyCoverage: ['jobs', 'tildeling', 'checklister', 'filer', 'mine opgaver'],
  },
  {
    id: 'mine-opgaver',
    title: 'Mine opgaver',
    description: 'Tildelte opgaver og egne deadlines',
    accent: '#60a5fa',
    icon: TaskAltIcon,
    status: 'ok',
    sprint: 'Sprint 4',
    legacyCoverage: ['åbne opgaver', 'status', 'kommentarer', 'jobflow'],
  },
  {
    id: 'lagerstyring',
    title: 'Lagerstyring',
    description: 'Beholdning, lokationer, QR og indkøbsliste',
    accent: '#ffd166',
    icon: InventoryIcon,
    status: 'ok',
    sprint: 'Sprint 5',
    legacyCoverage: ['minimum/maksimum', 'lagerlog', 'QR', 'lokationer', 'alarmer'],
  },
  {
    id: 'sds',
    title: 'SDS',
    description: 'Sikkerhedsdatablade, kemikalier og værnemidler',
    accent: '#fbbf24',
    icon: DescriptionIcon,
    status: 'ok',
    sprint: 'Sprint 5',
    legacyCoverage: ['PDF', 'billeder', 'fareklasse', 'nødtelefon', 'lokationer'],
  },
  {
    id: 'hr',
    title: 'HR',
    description: 'Ferie, fri, saldo, kalender og godkendelser',
    accent: '#34d399',
    icon: PeopleIcon,
    status: 'ok',
    badge: '1 afventer',
    sprint: 'Sprint 6',
    legacyCoverage: ['arbejdstid', 'ferieansøgning', 'saldo', 'HR-admin', 'feriekalender'],
  },
  {
    id: 'tid',
    title: 'Tid',
    description: 'Timer, udkald, godkendelse og takster',
    accent: '#f97316',
    icon: TimerIcon,
    status: 'ok',
    sprint: 'Sprint 6',
    legacyCoverage: ['tidslog', 'udkald', 'manuel registrering', 'admin-godkendelse'],
  },
  {
    id: 'how-to-do',
    title: 'How To Do',
    description: 'Guides, manualer og driftshjælp',
    accent: '#34d399',
    icon: MenuBookIcon,
    status: 'ok',
    sprint: 'Sprint 7',
    legacyCoverage: ['manualer', 'filer', 'lokationer', 'QR'],
  },
  {
    id: 'liveconnect',
    title: 'LiveConnect',
    description: 'Driftsdata og nøgletal',
    accent: '#10b981',
    icon: QueryStatsIcon,
    status: 'ok',
    sprint: 'Sprint 7',
    legacyCoverage: ['iframe-dashboard', 'ekstern data', 'fallback'],
  },
  {
    id: 'udstyr',
    title: 'Udstyr',
    description: 'Udlån, reservation og godkendelsesstatus',
    accent: '#22d3ee',
    icon: EngineeringIcon,
    status: 'ok',
    sprint: 'Sprint 8',
    legacyCoverage: ['lån', 'reservationer', 'returnering', 'billeder', 'alarmer'],
  },
  {
    id: 'el-eftersyn',
    title: 'El-eftersyn',
    description: 'Eftersyn, fund og frister på udstyr',
    accent: '#f472b6',
    icon: ElectricalServicesIcon,
    status: 'warning',
    badge: '1 kræver eftersyn',
    sprint: 'Sprint 8',
    legacyCoverage: ['inspektioner', 'godkendelse', 'fund', 'CSV', 'fristalarmer'],
  },
  {
    id: 'koeretoejer',
    title: 'Køretøjer',
    description: 'Service, syn, brændstof og kilometer',
    accent: '#38bdf8',
    icon: CalendarMonthIcon,
    status: 'planned',
    sprint: 'Sprint 9',
    legacyCoverage: ['nyt modul fra projektbrief'],
  },
  {
    id: 'anlaeg',
    title: 'Anlæg',
    description: 'Pumper, motorer, ventiler og historik',
    accent: '#2dd4bf',
    icon: FactoryIcon,
    status: 'planned',
    sprint: 'Sprint 9',
    legacyCoverage: ['nyt register', 'billeder', 'servicehistorik'],
  },
  {
    id: 'administration',
    title: 'Administration',
    description: 'Brugere, roller, backup og systemindstillinger',
    accent: '#94a3b8',
    icon: SettingsIcon,
    status: 'ok',
    sprint: 'Sprint 1',
    legacyCoverage: ['brugere', 'roller', 'moduladgang', 'backup', 'QR print'],
  },
  {
    id: 'vedligehold',
    title: 'Vedligeholdelsesplan',
    description: 'Serviceintervaller og gentagne opgaver',
    accent: '#facc15',
    icon: AssignmentTurnedInIcon,
    status: 'planned',
    sprint: 'Sprint 10',
    legacyCoverage: ['nyt modul koblet til Facility og Anlæg'],
  },
  {
    id: 'global-soegning',
    title: 'Global søgning',
    description: 'Find målere, udstyr, SDS, jobs og manualer',
    accent: '#c084fc',
    icon: ChecklistIcon,
    status: 'planned',
    sprint: 'Sprint 10',
    legacyCoverage: ['tværgående funktion'],
  },
];

export const dashboardMetrics = [
  { label: 'Måleraflæsninger mangler', value: 39, tone: '#ff6b6b' },
  { label: 'Runderinger mangler', value: 5, tone: '#a78bfa' },
  { label: 'Lave lagervarer', value: 1, tone: '#ffd166' },
  { label: 'HR ansøgninger', value: 1, tone: '#34d399' },
];
