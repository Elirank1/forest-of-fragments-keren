import { defaultProfiles } from '../data/profiles';
import { defaultSettings } from '../data/settings';
import type { PlayerProfile, RunRecord, SettingsData } from '../data/types';

const PROFILES_KEY = 'forest-of-fragments:profiles';
const LEADERBOARD_KEY = 'forest-of-fragments:leaderboard';
const SETTINGS_KEY = 'forest-of-fragments:settings';

const hasWindow = typeof window !== 'undefined';

function readJson<T>(key: string, fallback: T): T {
  if (!hasWindow) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!hasWindow) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export class StorageSystem {
  static getProfiles(): PlayerProfile[] {
    const profiles = readJson<PlayerProfile[]>(PROFILES_KEY, defaultProfiles);
    if (profiles.length === 0) {
      writeJson(PROFILES_KEY, defaultProfiles);
      return defaultProfiles;
    }
    return profiles;
  }

  static addProfile(name: string): PlayerProfile[] {
    const trimmed = name.trim();
    if (!trimmed) {
      return this.getProfiles();
    }

    const profiles = this.getProfiles();
    const profile: PlayerProfile = {
      id: `${trimmed.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: trimmed,
      createdAt: new Date().toISOString()
    };
    const next = [...profiles, profile];
    writeJson(PROFILES_KEY, next);
    return next;
  }

  static getLeaderboard(): RunRecord[] {
    return readJson<RunRecord[]>(LEADERBOARD_KEY, []).sort((a, b) => b.score - a.score);
  }

  static saveRun(record: RunRecord): RunRecord[] {
    const scores = this.getLeaderboard();
    const next = [...scores, record]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    writeJson(LEADERBOARD_KEY, next);
    return next;
  }

  static getSettings(): SettingsData {
    return readJson<SettingsData>(SETTINGS_KEY, defaultSettings);
  }

  static saveSettings(settings: SettingsData): SettingsData {
    writeJson(SETTINGS_KEY, settings);
    return settings;
  }
}
