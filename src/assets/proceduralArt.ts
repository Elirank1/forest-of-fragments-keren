import Phaser from 'phaser';

function jitter(value: number, range: number): number {
  return value + (Math.random() * 2 - 1) * range;
}

function scribbleLine(
  graphics: Phaser.GameObjects.Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  repeats = 2
): void {
  for (let i = 0; i < repeats; i += 1) {
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        jitter(x1, 1.8),
        jitter(y1, 1.8),
        jitter((x1 + x2) / 2, 4),
        jitter((y1 + y2) / 2, 4)
      )
    );
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        jitter((x1 + x2) / 2, 4),
        jitter((y1 + y2) / 2, 4),
        jitter(x2, 1.8),
        jitter(y2, 1.8)
      )
    );
  }
}

function fillScribbleBlob(
  graphics: Phaser.GameObjects.Graphics,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  fill: number,
  stroke: number,
  roughness = 8
): void {
  const points: Phaser.Geom.Point[] = [];
  const steps = 12;
  for (let i = 0; i < steps; i += 1) {
    const angle = (Math.PI * 2 * i) / steps;
    points.push(
      new Phaser.Geom.Point(
        centerX + Math.cos(angle) * jitter(radiusX, roughness),
        centerY + Math.sin(angle) * jitter(radiusY, roughness)
      )
    );
  }
  graphics.fillStyle(fill, 0.8);
  graphics.fillPoints(points, true);
  graphics.lineStyle(3, stroke, 0.95);
  graphics.strokePoints(points, true);
}

function addChaoticHalo(
  graphics: Phaser.GameObjects.Graphics,
  color: number,
  width: number,
  height: number,
  density = 20
): void {
  graphics.lineStyle(2, color, 0.22);
  for (let i = 0; i < density; i += 1) {
    scribbleLine(
      graphics,
      jitter(width / 2, width * 0.2),
      jitter(height / 2, height * 0.24),
      jitter(width / 2, width * 0.44),
      jitter(height / 2, height * 0.44),
      1
    );
  }
}

export function createPaperTexture(scene: Phaser.Scene, key: string, width: number, height: number): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0xf1eadb, 1);
  graphics.fillRect(0, 0, width, height);

  for (let i = 0; i < 1000; i += 1) {
    const tint = Phaser.Display.Color.GetColor(170 + Math.random() * 35, 150 + Math.random() * 35, 120 + Math.random() * 35);
    graphics.fillStyle(tint, 0.025);
    graphics.fillCircle(Math.random() * width, Math.random() * height, Math.random() * 2.3);
  }

  graphics.lineStyle(1, 0x766952, 0.05);
  for (let i = 0; i < 120; i += 1) {
    scribbleLine(
      graphics,
      Math.random() * width,
      Math.random() * height,
      Math.random() * width,
      Math.random() * height,
      1
    );
  }

  graphics.fillStyle(0x4f4331, 0.035);
  graphics.fillEllipse(width / 2, height / 2, width * 1.06, height * 1.02);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

export function createGuardianTexture(scene: Phaser.Scene, key: string, bodyColor: number, accent: number): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  addChaoticHalo(graphics, bodyColor, 84, 92, 18);
  fillScribbleBlob(graphics, 34, 30, 17, 19, bodyColor, accent, 4);

  graphics.lineStyle(4, accent, 0.95);
  scribbleLine(graphics, 18, 18, 12, 6, 2);
  scribbleLine(graphics, 46, 18, 54, 6, 2);
  scribbleLine(graphics, 20, 42, 10, 62, 2);
  scribbleLine(graphics, 48, 42, 57, 63, 2);
  scribbleLine(graphics, 18, 33, 2, 43, 2);
  scribbleLine(graphics, 46, 34, 62, 42, 2);

  graphics.fillStyle(0x111111, 1);
  graphics.fillCircle(24, 24, 6);
  graphics.fillCircle(39, 26, 7);
  graphics.fillStyle(0xf6f0d8, 0.6);
  graphics.fillCircle(22, 21, 1.5);
  graphics.fillCircle(37, 23, 1.5);
  graphics.lineStyle(2, accent, 0.75);
  scribbleLine(graphics, 31, 31, 28, 35, 1);

  graphics.generateTexture(key, 64, 72);
  graphics.destroy();
}

export function createEnemyTexture(scene: Phaser.Scene, key: string, color: number, accent = 0x111111): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  addChaoticHalo(graphics, color, 68, 68, 22);
  fillScribbleBlob(graphics, 24, 24, 14, 15, color, accent, 5);

  graphics.lineStyle(4, accent, 0.96);
  scribbleLine(graphics, 18, 11, 8, 2, 2);
  scribbleLine(graphics, 31, 12, 40, 2, 2);
  scribbleLine(graphics, 16, 36, 7, 49, 2);
  scribbleLine(graphics, 32, 36, 42, 48, 2);
  scribbleLine(graphics, 12, 26, 0, 26, 2);
  scribbleLine(graphics, 34, 26, 47, 28, 2);

  graphics.fillStyle(0x111111, 1);
  graphics.fillCircle(18, 20, 5);
  graphics.fillCircle(30, 22, 5.5);
  graphics.fillStyle(0xf5edda, 0.35);
  graphics.fillCircle(16, 18, 1.2);
  graphics.fillCircle(28, 19, 1.2);

  graphics.generateTexture(key, 48, 56);
  graphics.destroy();
}

export function createDestroyerTexture(
  scene: Phaser.Scene,
  key: string,
  color: number,
  accent: number,
  mood: 'green' | 'orange' | 'pink' | 'purple'
): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  addChaoticHalo(graphics, color, 110, 110, mood === 'orange' ? 42 : 30);

  if (mood === 'orange') {
    graphics.lineStyle(2, 0xffc07d, 0.4);
    for (let i = 0; i < 18; i += 1) {
      scribbleLine(graphics, 42, 34, jitter(75, 22), jitter(20, 30), 1);
    }
  }

  if (mood === 'green') {
    graphics.lineStyle(2, 0xa1d36d, 0.32);
    for (let i = 0; i < 16; i += 1) {
      scribbleLine(graphics, 40, 34, jitter(68, 18), jitter(38, 24), 1);
    }
  }

  if (mood === 'pink') {
    graphics.lineStyle(2, 0xffc7de, 0.34);
    for (let i = 0; i < 14; i += 1) {
      scribbleLine(graphics, 40, 34, jitter(64, 20), jitter(34, 24), 1);
    }
  }

  fillScribbleBlob(graphics, 40, 34, mood === 'orange' ? 20 : 18, mood === 'orange' ? 18 : 19, color, accent, 6);

  graphics.lineStyle(5, accent, 0.96);
  scribbleLine(graphics, 18, 12, 6, 0, 3);
  scribbleLine(graphics, 60, 12, 74, 0, 3);
  scribbleLine(graphics, 20, 46, 8, 70, 3);
  scribbleLine(graphics, 60, 46, 72, 70, 3);
  scribbleLine(graphics, 12, 34, 0, 38, 3);
  scribbleLine(graphics, 68, 34, 82, 38, 3);

  graphics.fillStyle(0x111111, 1);
  graphics.fillCircle(30, 28, mood === 'orange' ? 8 : 9);
  graphics.fillCircle(47, 29, mood === 'orange' ? 8 : 9);
  graphics.fillStyle(0xf7f1de, 0.24);
  graphics.fillCircle(28, 25, 1.4);
  graphics.fillCircle(45, 26, 1.4);

  graphics.generateTexture(key, 88, 84);
  graphics.destroy();
}

export function createLionTexture(scene: Phaser.Scene, key: string): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  addChaoticHalo(graphics, 0xd7b467, 100, 92, 20);
  fillScribbleBlob(graphics, 46, 34, 20, 18, 0xdab96a, 0x4a3318, 7);

  graphics.lineStyle(4, 0x4a3318, 0.92);
  for (let i = 0; i < 16; i += 1) {
    const angle = (Math.PI * 2 * i) / 16;
    scribbleLine(
      graphics,
      46,
      34,
      46 + Math.cos(angle) * jitter(32, 6),
      34 + Math.sin(angle) * jitter(29, 6),
      1
    );
  }
  scribbleLine(graphics, 24, 44, 14, 62, 2);
  scribbleLine(graphics, 64, 44, 76, 62, 2);

  graphics.fillStyle(0x151008, 1);
  graphics.fillCircle(37, 29, 5);
  graphics.fillCircle(51, 29, 5);
  graphics.fillStyle(0xf7f1de, 0.28);
  graphics.fillCircle(35, 26, 1.2);
  graphics.fillCircle(49, 26, 1.2);

  graphics.generateTexture(key, 92, 76);
  graphics.destroy();
}
