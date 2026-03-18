import type { PlayerProfile } from './types';

export const defaultProfiles: PlayerProfile[] = [
  { id: 'lavi', name: 'Lavi', createdAt: new Date('2024-01-01').toISOString() },
  { id: 'yuval', name: 'Yuval', createdAt: new Date('2024-01-02').toISOString() },
  { id: 'niv', name: 'Niv', createdAt: new Date('2024-01-03').toISOString() }
];
