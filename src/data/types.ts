export type GuardianAbilityType = 'roots' | 'dash' | 'slam';

export interface GuardianData {
  id: string;
  name: string;
  title: string;
  color: number;
  accent: number;
  description: string;
  speed: number;
  jump: number;
  maxHealth: number;
  attackDamage: number;
  specialCooldown: number;
  specialType: GuardianAbilityType;
}

export interface DestroyerData {
  id: string;
  name: string;
  color: number;
  accent: number;
  maxHealth: number;
  speed: number;
  damage: number;
  narrative: string;
  placeholder?: boolean;
  role: 'destroyer' | 'guide';
}

export interface EnemyData {
  id: string;
  name: string;
  color: number;
  speed: number;
  maxHealth: number;
  damage: number;
  scoreValue: number;
}

export interface AbilityData {
  id: string;
  name: string;
  type: GuardianAbilityType;
  cooldown: number;
  description: string;
}

export interface WaveSpawn {
  type: 'enemy' | 'destroyer' | 'lion';
  id: string;
  count?: number;
  delay: number;
  message: string;
}

export interface LevelData {
  id: string;
  name: string;
  intro: string;
  backgroundColors: number[];
  waves: WaveSpawn[];
}

export interface AudioCueData {
  id: string;
  kind: 'sfx' | 'music';
  description: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  createdAt: string;
}

export interface RunRecord {
  id: string;
  playerName: string;
  guardianId: string;
  guardianName: string;
  score: number;
  enemiesDefeated: number;
  runDurationMs: number;
  levelId: string;
  createdAt: string;
}

export interface SettingsData {
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface GameSession {
  profile: PlayerProfile;
  guardian: GuardianData;
  levelId: string;
}
