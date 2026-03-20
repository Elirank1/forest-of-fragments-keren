import Phaser from 'phaser';

export interface BackdropOptions {
  top: number;
  bottom: number;
  haze: number;
  ember?: number;
}

export function buildBackdrop(scene: Phaser.Scene, options: BackdropOptions): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;
  scene.add.image(width / 2, height / 2, 'paper').setDisplaySize(width, height).setAlpha(0.84);

  const gradient = scene.add.graphics();
  gradient.fillGradientStyle(options.top, options.top, options.bottom, options.bottom, 1);
  gradient.fillRect(0, 0, width, height);
  gradient.setAlpha(0.96);
  const burn = scene.add.rectangle(width / 2, height / 2, width, height, 0x0d0d0a, 0.16);
  const emberGlow = scene.add.ellipse(width * 0.66, height * 0.18, 220, 160, options.ember ?? 0xf0c26c, 0.12).setBlendMode(Phaser.BlendModes.ADD);

  const deep = scene.add.container(0, 0);
  const mid = scene.add.container(0, 0);
  const front = scene.add.container(0, 0);

  for (let i = 0; i < 7; i += 1) {
    deep.add(
      scene.add
        .ellipse(40 + i * 66, 110 + i * 26, 120, 260, 0x11140f, 0.3)
        .setAngle(i % 2 === 0 ? -12 : 8)
    );
  }

  for (let i = 0; i < 8; i += 1) {
    mid.add(
      scene.add
        .ellipse(10 + i * 58, 220 + (i % 3) * 42, 80, 220, 0x24321e, 0.22)
        .setAngle(i % 2 === 0 ? 10 : -8)
    );
  }

  for (let i = 0; i < 24; i += 1) {
    front.add(
      scene.add
        .ellipse(Phaser.Math.Between(0, width), height - Phaser.Math.Between(70, 160), Phaser.Math.Between(34, 80), Phaser.Math.Between(10, 24), 0x3a522d, 0.26)
        .setAngle(Phaser.Math.Between(-12, 12))
    );
  }

  for (let i = 0; i < 10; i += 1) {
    front.add(
      scene.add
        .ellipse(Phaser.Math.Between(0, width), Phaser.Math.Between(80, height - 180), Phaser.Math.Between(18, 34), Phaser.Math.Between(8, 14), 0xe6d09b, 0.06)
        .setAngle(Phaser.Math.Between(-30, 30))
    );
  }

  const haze = scene.add.rectangle(width / 2, height / 2, width, height, options.haze, 0.06);
  const vignette = scene.add.graphics();
  vignette.fillStyle(0x000000, 0.26);
  vignette.fillEllipse(width / 2, -40, width * 1.4, height * 0.44);
  vignette.fillEllipse(width / 2, height + 40, width * 1.4, height * 0.48);
  vignette.fillEllipse(-34, height / 2, width * 0.36, height * 1.3);
  vignette.fillEllipse(width + 34, height / 2, width * 0.36, height * 1.3);

  const dust = scene.add.particles(0, 0, 'paper', {
    x: { min: 0, max: width },
    y: { min: 0, max: height },
    lifespan: 7000,
    speedY: { min: -4, max: 4 },
    speedX: { min: -2, max: 2 },
    scale: { start: 0.02, end: 0.002 },
    alpha: { start: 0.09, end: 0 },
    tint: options.ember ?? 0xe7d7b8,
    quantity: 1,
    frequency: 380
  });

  const scratches = scene.add.graphics();
  scratches.lineStyle(1, 0xf3e6c6, 0.05);
  for (let i = 0; i < 120; i += 1) {
    scratches.strokeLineShape(
      new Phaser.Geom.Line(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height)
      )
    );
  }

  scene.tweens.add({
    targets: [deep],
    x: 10,
    duration: 9000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });
  scene.tweens.add({
    targets: [mid],
    x: -12,
    duration: 7000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });
  scene.tweens.add({
    targets: emberGlow,
    alpha: { from: 0.08, to: 0.16 },
    scaleX: 1.04,
    scaleY: 1.06,
    duration: 2400,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });

  return scene.add.container(0, 0, [gradient, burn, emberGlow, deep, mid, front, haze, dust, scratches, vignette]);
}

export function fadeInScene(scene: Phaser.Scene): void {
  scene.cameras.main.fadeIn(420, 10, 10, 10);
}

export function transitionToScene(scene: Phaser.Scene, key: string, data?: object): void {
  scene.cameras.main.fadeOut(240, 8, 8, 8);
  scene.time.delayedCall(240, () => scene.scene.start(key, data));
}
