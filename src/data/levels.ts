import type { LevelData } from './types';

export const levels: LevelData[] = [
  {
    id: 'breaking-grove',
    name: 'Breaking Grove',
    intro: 'The forest is breaking. Some want to save it. Some want to end it.',
    backgroundColors: [0x1a1d14, 0x304025, 0x8a4a22],
    waves: [
      {
        type: 'enemy',
        id: 'corrupted-sapling',
        count: 4,
        delay: 1500,
        message: 'The grove stirs with broken roots.'
      },
      {
        type: 'enemy',
        id: 'ash-skipper',
        count: 5,
        delay: 3500,
        message: 'Cinders creep between the branches.'
      },
      {
        type: 'destroyer',
        id: 'green-destroyer',
        delay: 7000,
        message: 'Green Destroyer arrives without anger.'
      },
      {
        type: 'lion',
        id: 'lion',
        delay: 12000,
        message: 'The Lion speaks softly: "Nothing whole stays whole."'
      },
      {
        type: 'enemy',
        id: 'thorn-shade',
        count: 4,
        delay: 15000,
        message: 'The fox has guided more fragments here.'
      },
      {
        type: 'destroyer',
        id: 'orange-destroyer',
        delay: 20000,
        message: 'Orange Destroyer tears through the clearing.'
      },
      {
        type: 'destroyer',
        id: 'pink-destroyer',
        delay: 26000,
        message: 'A glowing, dangerous beauty enters the broken air.'
      }
    ]
  }
];
