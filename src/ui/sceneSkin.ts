import Phaser from 'phaser';

export interface BackdropOptions {
  top: number;
  bottom: number;
  haze: number;
  ember?: number;
}

function addForestSilhouettes(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  count: number,
  baseY: number,
  color: number,
  alpha: number
): void {
  const { width } = scene.scale;
  for (let i = 0; i < count; i += 1) {
    const x = (i / Math.max(1, count - 1)) * (width + 60) - 30;
    const trunk = scene.add.rectangle(x, baseY, Phaser.Math.Between(16, 28), Phaser.Math.Between(200, 360), color, alpha).setOrigin(0.5, 1);
    const canopy = scene.add.ellipse(
      x + Phaser.Math.Between(-12, 12),
      baseY - trunk.height + Phaser.Math.Between(18, 42),
      Phaser.Math.Between(120, 190),
      Phaser.Math.Between(120, 210),
      color,
      alpha * 0.9
    );
    container.add([trunk, canopy]);
  }
}

export function buildBackdrop(scene: Phaser.Scene, options: BackdropOptions): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;
  const gradient = scene.add.graphics();
  gradient.fillGradientStyle(options.top, options.top, options.bottom, options.bottom, 1);
  gradient.fillRect(0, 0, width, height);

  const paper = scene.add.image(width / 2, height / 2, 'paper').setDisplaySize(width, height).setAlpha(0.2);
  const haze = scene.add.rectangle(width / 2, height / 2, width, height, options.haze, 0.08);
  const burn = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.18);

  const moonGlow = scene.add.ellipse(width * 0.72, height * 0.18, width * 0.5, 180, options.ember ?? 0xffd08a, 0.1).setBlendMode(Phaser.BlendModes.ADD);
  const greenGlow = scene.add.ellipse(width * 0.25, height * 0.23, width * 0.36, 160, 0x84d36b, 0.08).setBlendMode(Phaser.BlendModes.ADD);

  const deep = scene.add.container(0, 0);
  const mid = scene.add.container(0, 0);
  const front = scene.add.container(0, 0);

  addForestSilhouettes(scene, deep, 6, height * 0.82, 0x09100c, 0.46);
  addForestSilhouettes(scene, mid, 8, height * 0.86, 0x142219, 0.38);

  for (let i = 0; i < 24; i += 1) {
    front.add(
      scene.add
        .ellipse(
          Phaser.Math.Between(-20, width + 20),
          height - Phaser.Math.Between(28, 110),
          Phaser.Math.Between(42, 140),
          Phaser.Math.Between(10, 30),
          i % 4 === 0 ? 0xd1ba7f : 0x3d5f38,
          i % 4 === 0 ? 0.08 : 0.26
        )
        .setAngle(Phaser.Math.Between(-16, 16))
    );
  }

  const scratches = scene.add.graphics();
  scratches.lineStyle(1, 0xf0e2bb, 0.03);
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

  const vignette = scene.add.graphics();
  vignette.fillStyle(0x000000, 0.34);
  vignette.fillEllipse(width / 2, -60, width * 1.5, height * 0.42);
  vignette.fillEllipse(width / 2, height + 60, width * 1.5, height * 0.46);
  vignette.fillEllipse(-60, height / 2, width * 0.42, height * 1.4);
  vignette.fillEllipse(width + 60, height / 2, width * 0.42, height * 1.4);

  const dust = scene.add.particles(0, 0, 'paper', {
    x: { min: 0, max: width },
    y: { min: 0, max: height },
    lifespan: 6000,
    speedY: { min: -6, max: 3 },
    speedX: { min: -3, max: 3 },
    scale: { start: 0.03, end: 0.002 },
    alpha: { start: 0.08, end: 0 },
    tint: options.ember ?? 0xffd08a,
    quantity: 1,
    frequency: 300
  });

  scene.tweens.add({
    targets: deep,
    x: 12,
    duration: 10000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });
  scene.tweens.add({
    targets: mid,
    x: -16,
    duration: 7200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });
  scene.tweens.add({
    targets: [moonGlow, greenGlow],
    alpha: { from: 0.06, to: 0.16 },
    duration: 2400,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });

  return scene.add.container(0, 0, [gradient, paper, haze, burn, moonGlow, greenGlow, deep, mid, front, dust, scratches, vignette]);
}

export function fadeInScene(scene: Phaser.Scene): void {
  scene.cameras.main.fadeIn(420, 6, 8, 8);
}

export function transitionToScene(scene: Phaser.Scene, key: string, data?: object): void {
  scene.cameras.main.fadeOut(260, 6, 8, 8);
  scene.time.delayedCall(260, () => scene.scene.start(key, data));
}
