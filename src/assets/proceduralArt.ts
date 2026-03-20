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
  repeats = 2,
  bend = 6
): void {
  for (let i = 0; i < repeats; i += 1) {
    const midX = jitter((x1 + x2) / 2, bend);
    const midY = jitter((y1 + y2) / 2, bend);
    graphics.strokeLineShape(new Phaser.Geom.Line(jitter(x1, 2), jitter(y1, 2), midX, midY));
    graphics.strokeLineShape(new Phaser.Geom.Line(midX, midY, jitter(x2, 2), jitter(y2, 2)));
  }
}

function scribbleStrokeEllipse(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  alpha: number,
  strokes: number
): void {
  graphics.lineStyle(2, color, alpha);
  for (let i = 0; i < strokes; i += 1) {
    graphics.strokeEllipse(jitter(x, 4), jitter(y, 4), jitter(width, 8), jitter(height, 8));
  }
}

function fillRoughBlob(
  graphics: Phaser.GameObjects.Graphics,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  fill: number,
  stroke: number,
  alpha = 0.92,
  roughness = 12
): void {
  const points: Phaser.Geom.Point[] = [];
  const steps = 16;
  for (let i = 0; i < steps; i += 1) {
    const angle = (Math.PI * 2 * i) / steps;
    points.push(
      new Phaser.Geom.Point(
        centerX + Math.cos(angle) * jitter(radiusX, roughness),
        centerY + Math.sin(angle) * jitter(radiusY, roughness)
      )
    );
  }
  graphics.fillStyle(fill, alpha);
  graphics.fillPoints(points, true);
  graphics.lineStyle(3, stroke, 0.9);
  graphics.strokePoints(points, true);
}

function addEnergyStrands(
  graphics: Phaser.GameObjects.Graphics,
  centerX: number,
  centerY: number,
  color: number,
  minLength: number,
  maxLength: number,
  count: number,
  alpha = 0.22
): void {
  graphics.lineStyle(2, color, alpha);
  for (let i = 0; i < count; i += 1) {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const length = Phaser.Math.FloatBetween(minLength, maxLength);
    scribbleLine(
      graphics,
      centerX + Math.cos(angle) * Phaser.Math.FloatBetween(8, 24),
      centerY + Math.sin(angle) * Phaser.Math.FloatBetween(6, 24),
      centerX + Math.cos(angle) * length,
      centerY + Math.sin(angle) * length,
      1,
      10
    );
  }
}

function addFloatingLimbs(
  graphics: Phaser.GameObjects.Graphics,
  centerX: number,
  centerY: number,
  color: number,
  limbColor: number,
  scale: number
): void {
  const limbs = [
    [-34, -18, -56, -40],
    [38, -16, 61, -38],
    [-38, 12, -70, 18],
    [42, 14, 74, 18],
    [-24, 40, -38, 78],
    [26, 42, 42, 80]
  ];
  graphics.lineStyle(Math.max(3, scale), limbColor, 0.95);
  limbs.forEach(([x1, y1, x2, y2], index) => {
    scribbleLine(
      graphics,
      centerX + x1,
      centerY + y1,
      centerX + x2 + (index % 2 === 0 ? -4 : 4),
      centerY + y2,
      3,
      7
    );
    graphics.lineStyle(Math.max(2, scale - 1), color, 0.2);
    scribbleLine(
      graphics,
      centerX + x1,
      centerY + y1,
      centerX + x2,
      centerY + y2,
      1,
      9
    );
    graphics.lineStyle(Math.max(3, scale), limbColor, 0.95);
  });
}

function addEyes(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  leftR: number,
  rightR: number,
  glow: number
): void {
  graphics.fillStyle(glow, 0.08);
  graphics.fillCircle(x - 16, y - 2, leftR + 6);
  graphics.fillCircle(x + 9, y, rightR + 6);
  graphics.fillStyle(0x090909, 1);
  graphics.fillCircle(x - 16, y - 2, leftR);
  graphics.fillCircle(x + 9, y, rightR);
  graphics.fillStyle(0xffffff, 0.11);
  graphics.fillCircle(x - 20, y - 6, 2);
  graphics.fillCircle(x + 5, y - 4, 2);
}

function addSnout(graphics: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
  graphics.lineStyle(2, color, 0.8);
  scribbleLine(graphics, x - 2, y + 16, x + 4, y + 22, 1, 2);
  scribbleLine(graphics, x + 4, y + 22, x + 1, y + 28, 1, 2);
}

export function createPaperTexture(scene: Phaser.Scene, key: string, width: number, height: number): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0xd8ccb0, 1);
  graphics.fillRect(0, 0, width, height);

  for (let i = 0; i < 1800; i += 1) {
    const tint = Phaser.Display.Color.GetColor(
      Phaser.Math.Between(118, 154),
      Phaser.Math.Between(100, 132),
      Phaser.Math.Between(80, 104)
    );
    graphics.fillStyle(tint, Phaser.Math.FloatBetween(0.018, 0.05));
    graphics.fillCircle(Math.random() * width, Math.random() * height, Math.random() * 2.5);
  }

  for (let i = 0; i < 160; i += 1) {
    graphics.lineStyle(1, 0x20160f, 0.028);
    scribbleLine(graphics, Math.random() * width, Math.random() * height, Math.random() * width, Math.random() * height, 1, 18);
  }

  graphics.fillStyle(0x000000, 0.18);
  graphics.fillEllipse(width / 2, -80, width * 1.25, height * 0.4);
  graphics.fillEllipse(width / 2, height + 80, width * 1.25, height * 0.44);
  graphics.fillEllipse(-70, height / 2, width * 0.36, height * 1.2);
  graphics.fillEllipse(width + 70, height / 2, width * 0.36, height * 1.2);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

export function createGuardianTexture(scene: Phaser.Scene, key: string, bodyColor: number, accent: number): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  addEnergyStrands(graphics, 56, 54, bodyColor, 48, 78, 34, 0.16);
  fillRoughBlob(graphics, 56, 52, 24, 24, bodyColor, accent, 0.9, 8);
  addFloatingLimbs(graphics, 56, 52, bodyColor, accent, 4);
  addEyes(graphics, 56, 50, 9, 10, bodyColor);
  addSnout(graphics, 60, 48, accent);
  graphics.generateTexture(key, 112, 120);
  graphics.destroy();
}

export function createEnemyTexture(scene: Phaser.Scene, key: string, color: number, accent = 0x111111): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  addEnergyStrands(graphics, 42, 40, color, 32, 56, 24, 0.12);
  fillRoughBlob(graphics, 42, 40, 18, 17, color, accent, 0.92, 6);
  addFloatingLimbs(graphics, 42, 40, color, accent, 3);
  addEyes(graphics, 42, 39, 6, 7, color);
  addSnout(graphics, 46, 38, accent);
  graphics.generateTexture(key, 84, 84);
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
  const energyColor =
    mood === 'orange' ? 0xffd38e : mood === 'pink' ? 0xffbfd6 : mood === 'purple' ? 0xc3a2ff : 0xb7f08d;
  const haloColor = mood === 'orange' ? 0xff7f2a : mood === 'pink' ? 0xff78b0 : mood === 'purple' ? 0x8f73ff : 0x7bcf50;

  addEnergyStrands(graphics, 78, 72, haloColor, 56, 108, mood === 'orange' ? 60 : 44, mood === 'orange' ? 0.28 : 0.22);
  scribbleStrokeEllipse(graphics, 78, 72, mood === 'orange' ? 134 : 126, mood === 'orange' ? 116 : 122, energyColor, 0.11, 8);

  if (mood === 'orange') {
    graphics.fillStyle(0xffe2b3, 0.14);
    graphics.fillEllipse(92, 68, 90, 72);
  }

  if (mood === 'green') {
    graphics.fillStyle(0xd8ffaf, 0.08);
    graphics.fillEllipse(74, 70, 100, 82);
  }

  if (mood === 'pink') {
    graphics.fillStyle(0xffddf0, 0.12);
    graphics.fillEllipse(78, 72, 106, 88);
  }

  fillRoughBlob(graphics, 78, 70, mood === 'orange' ? 34 : 30, mood === 'orange' ? 29 : 31, color, accent, 0.95, 10);
  addFloatingLimbs(graphics, 78, 70, color, accent, 6);
  addEyes(graphics, 78, 69, mood === 'orange' ? 14 : 16, mood === 'orange' ? 14 : 16, haloColor);
  addSnout(graphics, 83, 69, accent);

  graphics.lineStyle(2, energyColor, 0.2);
  for (let i = 0; i < 12; i += 1) {
    const startX = 78 + Phaser.Math.Between(-8, 18);
    const startY = 70 + Phaser.Math.Between(-8, 16);
    const endX = startX + Phaser.Math.Between(14, 52) * (i % 2 === 0 ? 1 : -1);
    const endY = startY + Phaser.Math.Between(-32, 28);
    scribbleLine(graphics, startX, startY, endX, endY, 1, 9);
  }

  graphics.generateTexture(key, 156, 152);
  graphics.destroy();
}

export function createLionTexture(scene: Phaser.Scene, key: string): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  addEnergyStrands(graphics, 86, 76, 0xf0c26a, 56, 98, 34, 0.16);
  scribbleStrokeEllipse(graphics, 86, 76, 136, 112, 0xffde92, 0.08, 6);
  fillRoughBlob(graphics, 86, 76, 34, 30, 0xd7b15e, 0x36220f, 0.94, 10);
  graphics.lineStyle(4, 0x36220f, 0.92);
  for (let i = 0; i < 18; i += 1) {
    const angle = (Math.PI * 2 * i) / 18;
    scribbleLine(
      graphics,
      86 + Math.cos(angle) * 16,
      76 + Math.sin(angle) * 14,
      86 + Math.cos(angle) * Phaser.Math.FloatBetween(40, 62),
      76 + Math.sin(angle) * Phaser.Math.FloatBetween(34, 52),
      2,
      8
    );
  }
  addEyes(graphics, 86, 72, 8, 8, 0xf0c26a);
  addSnout(graphics, 90, 74, 0x36220f);
  scribbleLine(graphics, 66, 106, 54, 138, 2, 6);
  scribbleLine(graphics, 104, 106, 116, 138, 2, 6);
  graphics.generateTexture(key, 172, 160);
  graphics.destroy();
}

export function createTitleCollageTexture(scene: Phaser.Scene, key: string, width: number, height: number): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics({ x: 0, y: 0 });
  graphics.fillGradientStyle(0x30291e, 0x30291e, 0x0d100d, 0x0d100d, 1);
  graphics.fillRect(0, 0, width, height);

  graphics.fillStyle(0xe0d3b2, 0.86);
  graphics.fillRoundedRect(24, 24, width - 48, height - 48, 28);
  graphics.lineStyle(4, 0x23180f, 0.25);
  graphics.strokeRoundedRect(24, 24, width - 48, height - 48, 28);

  graphics.fillStyle(0x141612, 0.78);
  graphics.fillRoundedRect(48, 54, width * 0.42, height * 0.52, 14);
  graphics.fillStyle(0x32180c, 0.84);
  graphics.fillRoundedRect(width * 0.48, 54, width * 0.36, height * 0.58, 14);
  graphics.fillStyle(0x17100d, 0.86);
  graphics.fillRoundedRect(66, height * 0.62, width * 0.56, height * 0.24, 18);

  graphics.lineStyle(2, 0xe6dbbe, 0.05);
  for (let i = 0; i < 90; i += 1) {
    scribbleLine(graphics, Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 1, 16);
  }

  graphics.generateTexture(key, width, height);
  graphics.destroy();
}
