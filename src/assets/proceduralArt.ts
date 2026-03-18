import Phaser from 'phaser';

function jitter(value: number, range: number): number {
  return value + (Math.random() * 2 - 1) * range;
}

export function createPaperTexture(scene: Phaser.Scene, key: string, width: number, height: number): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0xe8dfcc, 1);
  graphics.fillRect(0, 0, width, height);
  for (let i = 0; i < 500; i += 1) {
    graphics.fillStyle(Phaser.Display.Color.GetColor(100 + Math.random() * 40, 90 + Math.random() * 35, 70), 0.04);
    graphics.fillCircle(Math.random() * width, Math.random() * height, Math.random() * 2.5);
  }
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

export function createGuardianTexture(scene: Phaser.Scene, key: string, bodyColor: number, accent: number): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.lineStyle(4, accent, 0.95);
  for (let i = 0; i < 14; i += 1) {
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        jitter(34, 12),
        jitter(12, 6),
        jitter(26, 18),
        jitter(58, 10)
      )
    );
  }
  graphics.fillStyle(bodyColor, 0.85);
  graphics.fillEllipse(32, 30, 34, 38);
  graphics.fillStyle(0x111111, 1);
  graphics.fillCircle(24, 24, 6);
  graphics.fillCircle(39, 27, 7);
  graphics.lineStyle(3, accent, 0.9);
  graphics.strokeLineShape(new Phaser.Geom.Line(18, 48, 10, 62));
  graphics.strokeLineShape(new Phaser.Geom.Line(46, 48, 55, 62));
  graphics.strokeLineShape(new Phaser.Geom.Line(16, 36, 2, 44));
  graphics.strokeLineShape(new Phaser.Geom.Line(48, 36, 61, 44));
  graphics.generateTexture(key, 64, 72);
  graphics.destroy();
}

export function createEnemyTexture(scene: Phaser.Scene, key: string, color: number): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.lineStyle(4, 0x101010, 1);
  for (let i = 0; i < 10; i += 1) {
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        jitter(20, 10),
        jitter(16, 8),
        jitter(20, 16),
        jitter(46, 10)
      )
    );
  }
  graphics.fillStyle(color, 0.82);
  graphics.fillEllipse(24, 24, 28, 30);
  graphics.fillStyle(0x111111, 1);
  graphics.fillCircle(18, 20, 5);
  graphics.fillCircle(30, 22, 5);
  graphics.generateTexture(key, 48, 56);
  graphics.destroy();
}

export function createLionTexture(scene: Phaser.Scene, key: string): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0xd4b265, 0.95);
  graphics.fillEllipse(44, 34, 42, 38);
  graphics.lineStyle(4, 0x4a3318, 0.9);
  for (let i = 0; i < 18; i += 1) {
    const angle = (Math.PI * 2 * i) / 18;
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        44,
        34,
        44 + Math.cos(angle) * jitter(32, 8),
        34 + Math.sin(angle) * jitter(30, 8)
      )
    );
  }
  graphics.fillStyle(0x18120a, 1);
  graphics.fillCircle(36, 29, 5);
  graphics.fillCircle(50, 29, 5);
  graphics.generateTexture(key, 88, 72);
  graphics.destroy();
}
