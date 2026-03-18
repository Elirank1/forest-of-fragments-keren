import Phaser from 'phaser';
import { guardians } from '../data/guardians';
import { gameState } from '../game/GameContext';
import { buildBackdrop, fadeInScene, transitionToScene } from '../ui/sceneSkin';
import { applyMenuMotion, createButton, createPanel } from '../ui/uiFactory';

export class GuardianSelectScene extends Phaser.Scene {
  constructor() {
    super('guardians');
  }

  create(): void {
    const { width, height } = this.scale;
    buildBackdrop(this, {
      top: 0x1a2418,
      bottom: 0x13100e,
      haze: 0x7f9450,
      ember: 0xdcc49d
    });
    fadeInScene(this);
    const heading = this.add.text(width / 2, 54, 'Choose a Guardian', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '28px' : '34px',
      color: '#f2ead8'
    }).setOrigin(0.5);
    const subheading = this.add.text(width / 2, 88, `${gameState.selectedProfile?.name ?? 'Wanderer'}, who will guard the fragments?`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#cbb89b'
    }).setOrigin(0.5);

    const panel = createPanel(this, width / 2, height / 2 + 26, width * 0.9, height * 0.8, 0.56);
    const cards: Phaser.GameObjects.GameObject[] = [];

    guardians.forEach((guardian, index) => {
      const cardY = 160 + index * 150;
      const glow = this.add.ellipse(width / 2, cardY + 2, width * 0.68, 96, guardian.color, 0.12).setBlendMode(Phaser.BlendModes.ADD);
      const card = this.add.rectangle(width / 2, cardY, width * 0.78, 118, 0x201a13, 0.82).setStrokeStyle(2, guardian.color);
      const portrait = this.add.image(width * 0.22, cardY, `guardian-${guardian.id}`).setScale(1.2);
      const name = this.add.text(width * 0.39, cardY - 34, guardian.name, {
        fontFamily: 'Georgia',
        fontSize: '22px',
        color: '#f4ecdc'
      });
      const title = this.add.text(width * 0.39, cardY - 4, guardian.title, {
        fontFamily: 'Trebuchet MS',
        fontSize: '14px',
        color: '#d0b98b'
      });
      const description = this.add.text(width * 0.39, cardY + 22, guardian.description, {
        fontFamily: 'Trebuchet MS',
        fontSize: '14px',
        color: '#d7d3c6',
        wordWrap: { width: width * 0.42 }
      });
      const zone = this.add.zone(width / 2, cardY, width * 0.78, 118).setInteractive();
      zone.on('pointerup', () => {
        gameState.selectedGuardian = guardian;
        transitionToScene(this, 'game');
      });
      zone.on('pointerdown', () => {
        card.setScale(0.985);
        this.tweens.add({ targets: glow, alpha: 0.24, duration: 90 });
      });
      zone.on('pointerout', () => {
        card.setScale(1);
        this.tweens.add({ targets: glow, alpha: 0.12, duration: 120 });
      });
      zone.on('pointerup', () => {
        card.setScale(1);
        this.tweens.add({ targets: glow, alpha: 0.12, duration: 120 });
      });
      this.tweens.add({
        targets: portrait,
        y: cardY - 4,
        duration: 1600 + index * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
      [glow, card, portrait, name, title, description].forEach((obj) => obj.setDepth(2));
      cards.push(glow, card, portrait, name, title, description);
    });

    const back = createButton(this, width / 2, height - 46, width * 0.5, 50, 'Back', () => transitionToScene(this, 'profiles'));
    applyMenuMotion(this, [heading, subheading, panel, ...cards, back], 40);
  }
}
