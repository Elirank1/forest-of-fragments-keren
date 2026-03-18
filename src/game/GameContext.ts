import type { GameSession, GuardianData, PlayerProfile, RunRecord, SettingsData } from '../data/types';

export interface GameState {
  selectedProfile?: PlayerProfile;
  selectedGuardian?: GuardianData;
  currentSession?: GameSession;
  latestRun?: RunRecord;
  settings: SettingsData;
}

export const gameState: GameState = {
  settings: {
    musicEnabled: true,
    sfxEnabled: true
  }
};
