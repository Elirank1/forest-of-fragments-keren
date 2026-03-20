import Phaser from 'phaser';
import { playUiTone } from '../systems/AudioSystem';
import { buildBackdrop, fadeInScene, transitionToScene } from '../ui/sceneSkin';
import { applyMenuMotion, createButton } from '../ui/uiFactory';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const { width, height } = this.scale;
    buildBackdrop(this, {
      top: 0x241b12,
      bottom: 0x060907,
      haze: 0x23412a,
      ember: 0xffab57
    });
    fadeInScene(this);
    playUiTone('title');

    const poster = this.add.image(width / 2, height * 0.45, 'title-collage').setDisplaySize(width * 0.94, height * 0.88).setAlpha(0.98);
    const leftDestroyerGlow = this.add.ellipse(width * 0.28, height * 0.22, 150, 170, 0x85d761, 0.18).setBlendMode(Phaser.BlendModes.ADD);
    const rightDestroyerGlow = this.add.ellipse(width * 0.72, height * 0.24, 170, 180, 0xff8f3a, 0.18).setBlendMode(Phaser.BlendModes.ADD);

    const leftDestroyer = this.add.image(width * 0.28, height * 0.23, 'destroyer-green-destroyer').setScale(width < 500 ? 1.12 : 1.36).setAngle(-10);
    const rightDestroyer = this.add.image(width * 0.72, height * 0.24, 'destroyer-orange-destroyer').setScale(width < 500 ? 1.18 : 1.42).setAngle(9);
    const pinkDestroyer = this.add.image(width * 0.34, height * 0.58, 'destroyer-pink-destroyer').setScale(width < 500 ? 0.86 : 1.04).setAngle(-7).setAlpha(0.92);

    const titleGlow = this.add.ellipse(width / 2, height * 0.14, width * 0.6, 110, 0xf9d998, 0.14).setBlendMode(Phaser.BlendModes.ADD);
    const titleBack = this.add.graphics();
    titleBack.fillStyle(0xe6d6b4, 0.94);
    titleBack.lineStyle(3, 0x23170f, 0.35);
    titleBack.fillRoundedRect(width * 0.1, height * 0.08, width * 0.8, 88, 16);
    titleBack.strokeRoundedRect(width * 0.1, height * 0.08, width * 0.8, 88, 16);

    const title = this.add.text(width / 2, height * 0.125, 'FOREST OF FRAGMENTS', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '30px' : '50px',
      fontStyle: 'bold',
      color: '#17120d',
      align: 'center'
    }).setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height * 0.18, 'A game by Mishpachat Keren', {
      fontFamily: 'Trebuchet MS',
      fontSize: width < 500 ? '17px' : '22px',
      color: '#ead7a1'
    }).setOrigin(0.5);

    const storyPanel = this.add.graphics();
    storyPanel.fillStyle(0x0f1411, 0.84);
    storyPanel.lineStyle(2, 0x95b372, 0.5);
    storyPanel.fillRoundedRect(width * 0.12, height * 0.38, width * 0.76, 112, 22);
    storyPanel.strokeRoundedRect(width * 0.12, height * 0.38, width * 0.76, 112, 22);

    const story = this.add.text(width / 2, height * 0.47, 'The forest is breaking.\nSome want to save it.\nSome want to end it.', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '18px' : '24px',
      color: '#f3e8c7',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    const begin = createButton(this, width / 2, height * 0.67, width * 0.64, 64, 'Begin', () => transitionToScene(this, 'profiles'), {
      glow: 0x8fd763,
      subtitle: 'Enter the family forest'
    });
    const board = createButton(this, width / 2, height * 0.77, width * 0.64, 64, 'Leaderboard', () => transitionToScene(this, 'leaderboard'), {
      glow: 0xf0b367,
      subtitle: 'See who restored the grove'
    });
    const settings = createButton(this, width / 2, height * 0.87, width * 0.64, 64, 'Settings', () => transitionToScene(this, 'settings'), {
      glow: 0xb4c0d8,
      subtitle: 'Audio and controls'
    });

    const credit = this.add.text(width / 2, height * 0.95, 'Inspired by drawings of the Keren children', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#cfbc8c'
    }).setOrigin(0.5);

    [leftDestroyer, rightDestroyer, pinkDestroyer].forEach((sprite, index) => {
      this.tweens.add({
        targets: sprite,
        y: sprite.y + (index === 1 ? 6 : 4),
        duration: 1800 + index * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    });

    this.tweens.add({
      targets: [leftDestroyerGlow, rightDestroyerGlow, titleGlow],
      alpha: { from: 0.1, to: 0.22 },
      duration: 1900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.tweens.add({
      targets: title,
      scaleX: 1.015,
      scaleY: 1.015,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    for (let i = 0; i < 12; i += 1) {
      const spark = this.add.circle(
        width / 2 + Phaser.Math.Between(-130, 130),
        height * 0.15 + Phaser.Math.Between(-22, 22),
        Phaser.Math.Between(2, 4),
        i % 2 === 0 ? 0xf8ebb8 : 0x9de36f,
        0.55
      ).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: spark,
        y: spark.y - Phaser.Math.Between(14, 36),
        alpha: 0,
        duration: 900 + Phaser.Math.Between(0, 400),
        delay: i * 140,
        repeat: -1
      });
    }

    applyMenuMotion(
      this,
      [
        poster,
        leftDestroyerGlow,
        rightDestroyerGlow,
        leftDestroyer,
        rightDestroyer,
        pinkDestroyer,
        titleGlow,
        titleBack,
        title,
        subtitle,
        storyPanel,
        story,
        begin,
        board,
        settings,
        credit
      ],
      55
    );
  }
}
