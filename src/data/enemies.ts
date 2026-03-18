import type { EnemyData } from './types';

export const enemies: EnemyData[] = [
  {
    id: 'corrupted-sapling',
    name: 'Corrupted Sapling',
    color: 0x75935f,
    speed: 70,
    maxHealth: 3,
    damage: 1,
    scoreValue: 100
  },
  {
    id: 'ash-skipper',
    name: 'Ash Skipper',
    color: 0xd98538,
    speed: 105,
    maxHealth: 2,
    damage: 1,
    scoreValue: 120
  },
  {
    id: 'thorn-shade',
    name: 'Thorn Shade',
    color: 0x6d7b4f,
    speed: 85,
    maxHealth: 4,
    damage: 2,
    scoreValue: 150
  }
];
