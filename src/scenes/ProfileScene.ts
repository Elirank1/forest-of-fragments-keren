import Phaser from 'phaser';
import { gameState } from '../game/GameContext';
import { playUiTone } from '../systems/AudioSystem';
import { StorageSystem } from '../systems/StorageSystem';
import { buildBackdrop, fadeInScene, transitionToScene } from '../ui/sceneSkin';
import { applyMenuMotion, createButton, createPanel } from '../ui/uiFactory';

export class ProfileScene extends Phaser.Scene {
  private profiles = StorageSystem.getProfiles();

  constructor() {
    super('profiles');
  }

  create(): void {
    const { width, height } = this.scale;
    buildBackdrop(this, {
      top: 0xf3efdf,
      bottom: 0x83aa72,
      haze: 0xd6eabf,
      ember: 0xf7d694
    });
    fadeInScene(this);
    const heading = this.add.text(width / 2, 60, 'Choose a Profile', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '30px' : '36px',
      color: '#263524'
    }).setOrigin(0.5);
    const subheading = this.add.text(width / 2, 90, 'Whose fragments are you carrying today?', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#56704b'
    }).setOrigin(0.5);
    const ribbon = this.add.text(width / 2, 122, 'Lavi   Yuval   Niv', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#88a960'
    }).setOrigin(0.5);

    const panel = createPanel(this, width / 2, height * 0.54, width * 0.88, height * 0.72, 0.62);
    const cards = this.renderProfiles();

    const back = createButton(this, width / 2, height - 60, width * 0.55, 52, 'Back', () => transitionToScene(this, 'title'));
    applyMenuMotion(this, [heading, subheading, ribbon, panel, ...cards, back], 55);
  }

  private renderProfiles(): Phaser.GameObjects.GameObject[] {
    const { width, height } = this.scale;
    const startY = 130;
    const spacing = 76;
    const entries: Phaser.GameObjects.GameObject[] = [];

    this.profiles.forEach((profile, index) => {
      const isFamilyProfile = ['Lavi', 'Yuval', 'Niv'].includes(profile.name);
      const button = createButton(this, width / 2, startY + index * spacing, width * 0.74, 58, profile.name, () => {
        const tone = profile.name === 'Lavi' ? 'lavi' : profile.name === 'Yuval' ? 'yuval' : profile.name === 'Niv' ? 'niv' : 'generic';
        playUiTone(tone);
        gameState.selectedProfile = profile;
        this.cameras.main.flash(140, 190, 220, 180, false);
        this.burst(button.x, button.y, isFamilyProfile ? 0xa8d476 : 0xd8c090);
        transitionToScene(this, 'guardians');
      }, {
        glow: isFamilyProfile ? 0x99c86a : 0xd6bd8f,
        subtitle: isFamilyProfile ? 'Keren family profile' : 'Forest guest'
      });
      if (isFamilyProfile) {
        this.tweens.add({
          targets: button,
          scaleX: 1.015,
          scaleY: 1.015,
          duration: 1300 + index * 180,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut'
        });
      }
      entries.push(button);
    });

    entries.push(createButton(
      this,
      width / 2,
      Math.min(height - 140, startY + this.profiles.length * spacing),
      width * 0.74,
      58,
      'Add New Profile',
      () => this.openAddProfilePrompt()
      , {
        glow: 0xaab8cc,
        subtitle: 'Expand the family circle'
      })
    );
    return entries;
  }

  private openAddProfilePrompt(): void {
    const name = window.prompt('Name for the new forest profile?');
    if (!name) {
      return;
    }
    this.profiles = StorageSystem.addProfile(name);
    this.scene.restart();
  }

  private burst(x: number, y: number, color: number): void {
    for (let i = 0; i < 8; i += 1) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.8);
      dot.setBlendMode(Phaser.BlendModes.ADD);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(20, 40);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: 260,
        onComplete: () => dot.destroy()
      });
    }
  }
}
