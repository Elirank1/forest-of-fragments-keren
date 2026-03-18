import Phaser from 'phaser';

export interface ButtonOptions {
  fill?: number;
  fillAlpha?: number;
  stroke?: number;
  glow?: number;
  fontSize?: string;
  textColor?: string;
  subtitle?: string;
}

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  options?: ButtonOptions
): Phaser.GameObjects.Container {
  const fill = options?.fill ?? 0x20160f;
  const fillAlpha = options?.fillAlpha ?? 0.88;
  const stroke = options?.stroke ?? 0xd6bd8f;
  const glowColor = options?.glow ?? stroke;

  const glow = scene.add
    .ellipse(0, 3, width * 0.82, height * 0.9, glowColor, 0.18)
    .setBlendMode(Phaser.BlendModes.ADD);

  const plate = scene.add.graphics();
  plate.fillStyle(fill, fillAlpha);
  plate.lineStyle(2, stroke, 0.95);
  plate.fillRoundedRect(-width / 2, -height / 2, width, height, 18);
  plate.strokeRoundedRect(-width / 2, -height / 2, width, height, 18);

  const sheen = scene.add.graphics();
  sheen.fillStyle(0xffffff, 0.08);
  sheen.fillRoundedRect(-width / 2 + 8, -height / 2 + 6, width - 16, height * 0.34, 14);

  const labelText = scene.add
    .text(0, options?.subtitle ? -8 : 0, label, {
      fontFamily: 'Georgia',
      fontSize: options?.fontSize ?? '22px',
      fontStyle: 'bold',
      color: options?.textColor ?? '#f7eed9',
      align: 'center',
      wordWrap: { width: width - 24 }
    })
    .setOrigin(0.5);

  const children: Phaser.GameObjects.GameObject[] = [glow, plate, sheen, labelText];

  if (options?.subtitle) {
    const subtitle = scene.add
      .text(0, 14, options.subtitle, {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#d6c3a3',
        align: 'center',
        wordWrap: { width: width - 28 }
      })
      .setOrigin(0.5);
    children.push(subtitle);
  }

  const container = scene.add.container(x, y, children);
  const hit = scene.add.zone(0, 0, width, height).setOrigin(0.5).setInteractive({ useHandCursor: true });
  container.add(hit);

  const press = () => {
    scene.tweens.killTweensOf(container);
    scene.tweens.killTweensOf(glow);
    scene.tweens.add({
      targets: [container],
      scaleX: 0.97,
      scaleY: 0.95,
      duration: 80,
      ease: 'Quad.easeOut'
    });
    scene.tweens.add({
      targets: glow,
      alpha: 0.32,
      duration: 100,
      ease: 'Sine.easeOut'
    });
  };

  const release = (trigger: boolean) => {
    scene.tweens.killTweensOf(container);
    scene.tweens.killTweensOf(glow);
    scene.tweens.add({
      targets: [container],
      scaleX: 1,
      scaleY: 1,
      duration: 140,
      ease: 'Back.easeOut'
    });
    scene.tweens.add({
      targets: glow,
      alpha: 0.18,
      duration: 160,
      ease: 'Sine.easeOut'
    });
    if (trigger) {
      onClick();
    }
  };

  hit.on('pointerdown', press);
  hit.on('pointerup', () => release(true));
  hit.on('pointerout', () => release(false));

  scene.tweens.add({
    targets: glow,
    alpha: { from: 0.12, to: 0.22 },
    scaleX: 1.02,
    scaleY: 1.02,
    duration: 1800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut'
  });

  return container;
}

export function createPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 0.72
): Phaser.GameObjects.Container {
  const shadow = scene.add.ellipse(0, 14, width * 0.92, height * 0.98, 0x000000, 0.22);
  const glass = scene.add.graphics();
  glass.fillStyle(0x120f0d, alpha);
  glass.lineStyle(2, 0xcfb78e, 0.65);
  glass.fillRoundedRect(-width / 2, -height / 2, width, height, 28);
  glass.strokeRoundedRect(-width / 2, -height / 2, width, height, 28);
  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, 0.05);
  shine.fillRoundedRect(-width / 2 + 8, -height / 2 + 8, width - 16, height * 0.18, 22);
  return scene.add.container(x, y, [shadow, glass, shine]);
}

export function applyMenuMotion(scene: Phaser.Scene, objects: Phaser.GameObjects.GameObject[], step = 60): void {
  objects.forEach((object, index) => {
    const transform = object as unknown as Phaser.GameObjects.Components.Transform;
    const alpha = object as unknown as Phaser.GameObjects.Components.AlphaSingle;
    const baseY = transform.y;
    const alphaTarget = alpha.alpha ?? 1;
    alpha.setAlpha?.(0);
    transform.setY?.(baseY + 22);
    scene.tweens.add({
      targets: object,
      alpha: alphaTarget,
      y: baseY,
      duration: 420,
      delay: index * step,
      ease: 'Cubic.easeOut'
    });
  });
}
