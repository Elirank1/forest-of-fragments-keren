import Phaser from 'phaser';
import { destroyers } from '../data/destroyers';
import { enemies } from '../data/enemies';
import { guardians } from '../data/guardians';
import { defaultSettings } from '../data/settings';
import { createEnemyTexture, createGuardianTexture, createLionTexture, createPaperTexture } from '../assets/proceduralArt';
import { gameState } from '../game/GameContext';
import { StorageSystem } from '../systems/StorageSystem';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    createPaperTexture(this, 'paper', 512, 912);
    guardians.forEach((guardian) => {
      createGuardianTexture(this, `guardian-${guardian.id}`, guardian.color, guardian.accent);
    });
    enemies.forEach((enemy) => {
      createEnemyTexture(this, `enemy-${enemy.id}`, enemy.color);
    });
    destroyers.forEach((destroyer) => {
      if (destroyer.id === 'lion') {
        createLionTexture(this, 'destroyer-lion');
        return;
      }
      createEnemyTexture(this, `destroyer-${destroyer.id}`, destroyer.color);
    });
  }

  create(): void {
    gameState.settings = StorageSystem.getSettings() ?? defaultSettings;
    this.scene.start('title');
  }
}
