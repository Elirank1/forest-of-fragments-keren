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
  const fill = options?.fill ?? 0x0e1411;
  const fillAlpha = options?.fillAlpha ?? 0.92;
  const stroke = options?.stroke ?? 0xdbc07a;
  const glowColor = options?.glow ?? stroke;

  const shadow = scene.add.ellipse(0, 10, width * 0.9, height * 0.86, 0x000000, 0.26);
  const glow = scene.add.ellipse(0, 2, width * 0.88, height * 0.84, glowColor, 0.16).setBlendMode(Phaser.BlendModes.ADD);

  const plate = scene.add.graphics();
  plate.fillStyle(fill, fillAlpha);
  plate.lineStyle(2, stroke, 0.9);
  plate.fillRoundedRect(-width / 2, -height / 2, width, height, 22);
  plate.strokeRoundedRect(-width / 2, -height / 2, width, height, 22);
  plate.lineStyle(1, 0xffffff, 0.08);
  plate.strokeRoundedRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12, 18);

  const sheen = scene.add.graphics();
  sheen.fillStyle(0xfff4d4, 0.06);
  sheen.fillRoundedRect(-width / 2 + 10, -height / 2 + 8, width - 20, height * 0.26, 16);

  const labelText = scene.add
    .text(0, options?.subtitle ? -8 : -1, label, {
      fontFamily: 'Georgia',
      fontSize: options?.fontSize ?? '22px',
      fontStyle: 'bold',
      color: options?.textColor ?? '#f7ebc7',
      align: 'center',
      wordWrap: { width: width - 24 }
    })
    .setOrigin(0.5);

  const children: Phaser.GameObjects.GameObject[] = [shadow, glow, plate, sheen, labelText];

  if (options?.subtitle) {
    const subtitle = scene.add
      .text(0, 14, options.subtitle, {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#d7c596',
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
      targets: container,
      scaleX: 0.97,
      scaleY: 0.95,
      y: y + 2,
      duration: 90,
      ease: 'Quad.easeOut'
    });
    scene.tweens.add({
      targets: glow,
      alpha: 0.28,
      duration: 100,
      ease: 'Sine.easeOut'
    });
  };

  const release = (trigger: boolean) => {
    scene.tweens.killTweensOf(container);
    scene.tweens.killTweensOf(glow);
    scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      y,
      duration: 180,
      ease: 'Back.easeOut'
    });
    scene.tweens.add({
      targets: glow,
      alpha: 0.16,
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
    alpha: { from: 0.1, to: 0.2 },
    scaleX: 1.03,
    scaleY: 1.03,
    duration: 1700,
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
  alpha = 0.78
): Phaser.GameObjects.Container {
  const shadow = scene.add.ellipse(0, 18, width * 0.94, height, 0x000000, 0.26);
  const glass = scene.add.graphics();
  glass.fillStyle(0x0d120f, alpha);
  glass.lineStyle(2, 0xd8bf7d, 0.72);
  glass.fillRoundedRect(-width / 2, -height / 2, width, height, 30);
  glass.strokeRoundedRect(-width / 2, -height / 2, width, height, 30);
  glass.lineStyle(1, 0xffffff, 0.06);
  glass.strokeRoundedRect(-width / 2 + 8, -height / 2 + 8, width - 16, height - 16, 24);
  const shine = scene.add.graphics();
  shine.fillStyle(0xfff0cb, 0.05);
  shine.fillRoundedRect(-width / 2 + 10, -height / 2 + 10, width - 20, height * 0.16, 20);
  return scene.add.container(x, y, [shadow, glass, shine]);
}

export function applyMenuMotion(scene: Phaser.Scene, objects: Phaser.GameObjects.GameObject[], step = 60): void {
  objects.forEach((object, index) => {
    const transform = object as unknown as Phaser.GameObjects.Components.Transform;
    const alpha = object as unknown as Phaser.GameObjects.Components.AlphaSingle;
    const baseY = transform.y;
    const alphaTarget = alpha.alpha ?? 1;
    alpha.setAlpha?.(0);
    transform.setY?.(baseY + 28);
    scene.tweens.add({
      targets: object,
      alpha: alphaTarget,
      y: baseY,
      duration: 460,
      delay: index * step,
      ease: 'Cubic.easeOut'
    });
  });
}
