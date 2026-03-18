import type { DestroyerData } from './types';

export const destroyers: DestroyerData[] = [
  {
    id: 'green-destroyer',
    name: 'Green Destroyer',
    color: 0x9acb57,
    accent: 0x111111,
    maxHealth: 15,
    speed: 110,
    damage: 2,
    narrative: 'Calm and deliberate, as if the forest asked it to erase itself.',
    role: 'destroyer'
  },
  {
    id: 'orange-destroyer',
    name: 'Orange Destroyer',
    color: 0xff9b36,
    accent: 0x23130d,
    maxHealth: 12,
    speed: 180,
    damage: 2,
    narrative: 'A burst of fire and fragments that attacks before fear catches up.',
    role: 'destroyer'
  },
  {
    id: 'pink-destroyer',
    name: 'Pink Destroyer',
    color: 0xff78bb,
    accent: 0x44142f,
    maxHealth: 14,
    speed: 130,
    damage: 3,
    narrative: 'A dangerous glow of feeling and beauty. Temporary form until Yuval replaces it.',
    placeholder: true,
    role: 'destroyer'
  },
  {
    id: 'purple-destroyer',
    name: 'Purple Destroyer',
    color: 0x9061ff,
    accent: 0x25134e,
    maxHealth: 18,
    speed: 120,
    damage: 3,
    narrative: 'Reserved in the system for the next fragment to arrive.',
    placeholder: true,
    role: 'destroyer'
  },
  {
    id: 'lion',
    name: 'The Lion',
    color: 0xe8c66b,
    accent: 0x4a3318,
    maxHealth: 20,
    speed: 150,
    damage: 4,
    narrative: 'Ancient, majestic, and not on the side you hoped.',
    role: 'guide'
  }
];
