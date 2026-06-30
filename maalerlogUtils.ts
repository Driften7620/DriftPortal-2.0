import type { SvgIconComponent } from '@mui/icons-material';

export type ModuleStatus = 'ok' | 'warning' | 'critical' | 'planned';

export interface DriftModule {
  id: string;
  title: string;
  description: string;
  accent: string;
  icon: SvgIconComponent;
  status: ModuleStatus;
  badge?: string;
  sprint: string;
  legacyCoverage: string[];
}
