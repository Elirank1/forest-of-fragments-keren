import Phaser from 'phaser';
import type { SettingsData } from '../data/types';

let audioContext: AudioContext | undefined;

function getAudioContext(): AudioContext | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  audioContext ??= new window.AudioContext();
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

function synthTone(frequency: number, durationMs: number, volume: number, type: OscillatorType, delayMs = 0): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.0001;
  oscillator.connect(gain);
  gain.connect(context.destination);
  const startAt = context.currentTime + delayMs / 1000;
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationMs / 1000);
  oscillator.start(startAt);
  oscillator.stop(startAt + durationMs / 1000);
}

export function playUiTone(kind: 'title' | 'lavi' | 'yuval' | 'niv' | 'generic' | 'reward'): void {
  const patterns: Record<typeof kind, Array<[number, number, number, OscillatorType, number?]>> = {
    title: [
      [220, 180, 0.02, 'sine'],
      [330, 220, 0.025, 'triangle', 120],
      [440, 260, 0.02, 'sine', 260]
    ],
    lavi: [
      [392, 100, 0.025, 'triangle'],
      [523, 130, 0.02, 'sine', 80]
    ],
    yuval: [
      [330, 110, 0.025, 'triangle'],
      [494, 150, 0.02, 'sine', 80]
    ],
    niv: [
      [262, 110, 0.025, 'triangle'],
      [392, 150, 0.02, 'sine', 80]
    ],
    generic: [
      [300, 90, 0.018, 'triangle'],
      [380, 120, 0.014, 'sine', 60]
    ],
    reward: [
      [520, 90, 0.02, 'triangle'],
      [660, 140, 0.018, 'sine', 50]
    ]
  };

  patterns[kind].forEach(([frequency, duration, volume, type, delay]) => {
    synthTone(frequency, duration, volume, type, delay ?? 0);
  });
}

export class AudioSystem {
  private volumes = {
    master: 1,
    ambient: 0.4,
    music: 0.65,
    sfx: 0.8
  };

  constructor(
    private scene: Phaser.Scene,
    private settings: SettingsData
  ) {}

  playSfx(id: string, options?: { volume?: number; rate?: number }): void {
    if (!this.settings.sfxEnabled) {
      return;
    }
    const volume = (options?.volume ?? 0.03) * this.volumes.sfx;
    const rate = options?.rate ?? 1;
    const palette: Record<string, Array<[number, number, OscillatorType]>> = {
      attack: [[260 * rate, 90, 'square'], [180 * rate, 120, 'triangle']],
      hit: [[140 * rate, 120, 'sawtooth']],
      'enemy-defeated': [[420 * rate, 100, 'triangle'], [560 * rate, 150, 'sine']],
      'wind-dash': [[700 * rate, 140, 'sine']],
      'root-trap': [[180 * rate, 180, 'triangle'], [230 * rate, 200, 'sine']],
      slam: [[120 * rate, 180, 'sawtooth']],
      'lion-appearance': [[98 * rate, 320, 'sawtooth'], [146 * rate, 420, 'triangle']],
      'score-tally': [[620 * rate, 90, 'triangle']]
    };
    (palette[id] ?? [[320 * rate, 110, 'triangle']]).forEach(([frequency, duration, type], index) => {
      synthTone(frequency, duration, Math.max(0.0001, volume - index * 0.006), type, index * 24);
    });
  }

  playMusic(_id: string): void {
    if (!this.settings.musicEnabled) {
      return;
    }
    synthTone(196, 1200, 0.008 * this.volumes.music, 'sine');
  }

  playAmbient(_id: string): void {
    if (!this.settings.musicEnabled) {
      return;
    }
    synthTone(130, 1800, 0.006 * this.volumes.ambient, 'triangle');
  }

  updateSettings(settings: SettingsData): void {
    this.settings = settings;
  }

  getVolumeBus(): typeof this.volumes {
    return this.volumes;
  }
}
