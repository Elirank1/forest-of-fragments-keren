import type { GuardianData } from './types';

export const guardians: GuardianData[] = [
  {
    id: 'tamar-root',
    name: 'Tamar Root',
    title: 'The Keeper of Tangled Walls',
    color: 0x7da460,
    accent: 0x42341c,
    description: 'Controls the floor with roots and holds the line under pressure.',
    speed: 200,
    jump: 370,
    maxHealth: 10,
    attackDamage: 2,
    specialCooldown: 8500,
    specialType: 'roots'
  },
  {
    id: 'aero-finch',
    name: 'Aero Finch',
    title: 'The Rush Between Branches',
    color: 0xa9d8d2,
    accent: 0x345766,
    description: 'Fast, evasive, and able to cut through danger with bursts of wind.',
    speed: 255,
    jump: 410,
    maxHealth: 8,
    attackDamage: 2,
    specialCooldown: 6000,
    specialType: 'dash'
  },
  {
    id: 'mossback',
    name: 'Mossback',
    title: 'The Spore-Bearer',
    color: 0x93a85d,
    accent: 0x283315,
    description: 'A heavy guardian who slams the earth and outlasts corrupted swarms.',
    speed: 180,
    jump: 320,
    maxHealth: 13,
    attackDamage: 3,
    specialCooldown: 9000,
    specialType: 'slam'
  }
];
