import Phaser from 'phaser';
import { playUiTone } from '../systems/AudioSystem';
import { buildBackdrop, fadeInScene, transitionToScene } from '../ui/sceneSkin';
import { applyMenuMotion, createButton, createPanel } from '../ui/uiFactory';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const { width, height } = this.scale;
    buildBackdrop(this, {
      top: 0x25311d,
      bottom: 0x100f0d,
      haze: 0x6a8d54,
      ember: 0xd4c4a1
    });
    fadeInScene(this);
    playUiTone('title');

    const glow = this.add.ellipse(width / 2, height * 0.18, width * 0.62, 120, 0xa7c770, 0.12).setBlendMode(Phaser.BlendModes.ADD);
    const frame = createPanel(this, width / 2, height * 0.53, width * 0.88, height * 0.74, 0.58);
    const title = this.add.text(width / 2, height * 0.15, 'FOREST OF FRAGMENTS', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '36px' : '52px',
      fontStyle: 'bold',
      color: '#f2ead8',
      align: 'center'
    }).setOrigin(0.5);
    title.setShadow(0, 8, '#000000', 14, false, true);
    title.setScale(0.9);

    const subtitle = this.add.text(width / 2, height * 0.225, 'A game by Mishpachat Keren', {
      fontFamily: 'Trebuchet MS',
      fontSize: width < 500 ? '18px' : '22px',
      color: '#dcc89f'
    }).setOrigin(0.5);

    const story = this.add.text(width / 2, height * 0.34, 'The forest is breaking.\nSome want to save it.\nSome want to end it.', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '20px' : '24px',
      color: '#d7d1bf',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    const begin = createButton(this, width / 2, height * 0.61, width * 0.6, 60, 'Begin', () => transitionToScene(this, 'profiles'), {
      glow: 0x91bf69,
      subtitle: 'Enter the family forest'
    });
    const board = createButton(this, width / 2, height * 0.71, width * 0.6, 60, 'Leaderboard', () => transitionToScene(this, 'leaderboard'), {
      glow: 0xe0b86f,
      subtitle: 'See who held the grove longest'
    });
    const settings = createButton(this, width / 2, height * 0.81, width * 0.6, 60, 'Settings', () => transitionToScene(this, 'settings'), {
      glow: 0xa2b6c8,
      subtitle: 'Audio and controls'
    });

    const credit = this.add.text(width / 2, height * 0.92, 'Inspired by drawings of the Keren children', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#cab38b'
    }).setOrigin(0.5);
    credit.setAlpha(0.86);

    this.tweens.add({
      targets: title,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.1, to: 0.24 },
      scaleX: 1.08,
      scaleY: 1.12,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    for (let i = 0; i < 10; i += 1) {
      const spark = this.add.circle(width / 2 + Phaser.Math.Between(-160, 160), height * 0.16 + Phaser.Math.Between(-40, 40), Phaser.Math.Between(2, 4), 0xf6edc8, 0.5);
      spark.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: spark,
        y: spark.y - Phaser.Math.Between(18, 44),
        alpha: 0,
        duration: 900 + Phaser.Math.Between(0, 500),
        delay: i * 160,
        repeat: -1
      });
    }

    applyMenuMotion(this, [glow, frame, title, subtitle, story, begin, board, settings, credit], 70);
  }
}
