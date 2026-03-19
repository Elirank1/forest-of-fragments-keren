import Phaser from 'phaser';
import { gameState } from '../game/GameContext';
import { StorageSystem } from '../systems/StorageSystem';
import { buildBackdrop, fadeInScene, transitionToScene } from '../ui/sceneSkin';
import { applyMenuMotion, createButton, createPanel } from '../ui/uiFactory';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('settings');
  }

  create(): void {
    const { width, height } = this.scale;
    buildBackdrop(this, {
      top: 0xf5efdf,
      bottom: 0x8fad7c,
      haze: 0xe1ebcc,
      ember: 0xf0d89f
    });
    fadeInScene(this);
    const panel = createPanel(this, width / 2, height / 2, width * 0.84, height * 0.6, 0.72);
    const heading = this.add.text(width / 2, 76, 'Settings', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '30px' : '36px',
      color: '#243423'
    }).setOrigin(0.5);

    const toggles = this.renderToggles();

    const back = createButton(this, width / 2, height - 54, width * 0.55, 50, 'Back', () => transitionToScene(this, 'title'));
    applyMenuMotion(this, [panel, heading, ...toggles, back], 48);
  }

  private renderToggles(): Phaser.GameObjects.GameObject[] {
    const { width } = this.scale;
    const settings = gameState.settings;
    const items: Phaser.GameObjects.GameObject[] = [];

    items.push(createButton(this, width / 2, 170, width * 0.62, 60, `Music: ${settings.musicEnabled ? 'On' : 'Off'}`, () => {
      settings.musicEnabled = !settings.musicEnabled;
      gameState.settings = StorageSystem.saveSettings(settings);
      this.scene.restart();
    }, {
      glow: 0x87a9c1,
      subtitle: 'Ambient layers and tone'
    }));

    items.push(createButton(this, width / 2, 252, width * 0.62, 60, `SFX: ${settings.sfxEnabled ? 'On' : 'Off'}`, () => {
      settings.sfxEnabled = !settings.sfxEnabled;
      gameState.settings = StorageSystem.saveSettings(settings);
      this.scene.restart();
    }, {
      glow: 0xa0c26f,
      subtitle: 'Impact, wind, roots, and score'
    }));

    items.push(this.add.text(width / 2, 350, 'Portrait-first controls\nKeyboard also supported:\nA/D move, W jump, Space attack, Shift special.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#4c6146',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5));
    return items;
  }
}
