import type { AbilityData } from './types';

export const abilities: AbilityData[] = [
  {
    id: 'root-trap',
    name: 'Root Trap',
    type: 'roots',
    cooldown: 8500,
    description: 'Summon roots that pin nearby enemies in place for a short burst.'
  },
  {
    id: 'wind-dash',
    name: 'Wind Dash',
    type: 'dash',
    cooldown: 6000,
    description: 'A fast, invulnerable glide that cuts through enemies.'
  },
  {
    id: 'spore-slam',
    name: 'Spore Slam',
    type: 'slam',
    cooldown: 9000,
    description: 'Crash into the ground, stunning enemies with a spore shockwave.'
  }
];
