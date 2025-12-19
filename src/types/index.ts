export * from '../types';

// Modos de visualização da sua aplicação
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  PUBLISH = 'PUBLISH',
  DESIGN = 'DESIGN',
  SETTINGS = 'SETTINGS',
}

// Papéis de usuário (pode ser expandido)
export enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
}
