export type UserRole =
  | 'system_admin'
  | 'admin'
  | 'hr_admin'
  | 'time_admin'
  | 'operator'
  | 'handyman'
  | 'office'
  | 'info_screen';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  moduleAccess: string[];
  isActive: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
}

export interface SignInInput {
  email: string;
  password: string;
}
