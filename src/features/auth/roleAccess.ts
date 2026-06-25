import type { UserProfile, UserRole } from '../../types/auth';

export const allModuleIds = [
  'dashboard',
  'maalerlog',
  'rundering',
  'facility-service',
  'mine-opgaver',
  'lagerstyring',
  'sds',
  'hr',
  'tid',
  'how-to-do',
  'liveconnect',
  'udstyr',
  'el-eftersyn',
  'koeretoejer',
  'anlaeg',
  'administration',
  'vedligehold',
  'global-soegning',
];

export const defaultModuleAccess: Record<UserRole, string[]> = {
  system_admin: allModuleIds,
  admin: allModuleIds.filter((id) => id !== 'info-screen'),
  hr_admin: ['dashboard', 'hr', 'tid', 'sds', 'udstyr', 'mine-opgaver'],
  time_admin: ['dashboard', 'tid', 'hr', 'sds', 'udstyr', 'mine-opgaver'],
  operator: [
    'dashboard',
    'maalerlog',
    'rundering',
    'facility-service',
    'mine-opgaver',
    'lagerstyring',
    'sds',
    'how-to-do',
    'liveconnect',
    'udstyr',
    'el-eftersyn',
  ],
  handyman: ['dashboard', 'facility-service', 'mine-opgaver', 'sds', 'how-to-do', 'udstyr'],
  office: ['dashboard', 'mine-opgaver', 'sds', 'udstyr'],
  info_screen: ['dashboard', 'liveconnect'],
};

export function canAccessModule(user: UserProfile | null, moduleId: string) {
  if (!user || !user.isActive) return false;
  if (user.role === 'system_admin') return true;
  return user.moduleAccess.includes(moduleId);
}

export function getDefaultModuleAccess(role: UserRole) {
  return defaultModuleAccess[role] ?? [];
}

export const demoUser: UserProfile = {
  id: 'demo-stefan',
  email: 'stefan@lemvig-varme.local',
  fullName: 'Stefan',
  role: 'system_admin',
  moduleAccess: allModuleIds,
  isActive: true,
};
