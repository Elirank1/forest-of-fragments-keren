import type { AudioCueData } from './types';

export const audioCues: AudioCueData[] = [
  { id: 'tap', kind: 'sfx', description: 'UI tap response' },
  { id: 'attack', kind: 'sfx', description: 'Basic guardian attack' },
  { id: 'hit', kind: 'sfx', description: 'Damage received' },
  { id: 'enemy-defeated', kind: 'sfx', description: 'Enemy defeat stinger' },
  { id: 'root-trap', kind: 'sfx', description: 'Tamar Root special' },
  { id: 'wind-dash', kind: 'sfx', description: 'Aero Finch special' },
  { id: 'slam', kind: 'sfx', description: 'Mossback special' },
  { id: 'lion-appearance', kind: 'sfx', description: 'Lion reveal cue' },
  { id: 'score-tally', kind: 'sfx', description: 'Score screen tally' },
  { id: 'title', kind: 'music', description: 'Title scene music hook' },
  { id: 'gameplay', kind: 'music', description: 'Core level music hook' },
  { id: 'tension-boss', kind: 'music', description: 'Destroyer encounter cue' }
];
