import Phaser from 'phaser';
import { destroyers } from '../data/destroyers';
import { enemies } from '../data/enemies';
import { levels } from '../data/levels';
import type { DestroyerData, EnemyData, RunRecord, WaveSpawn } from '../data/types';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { gameState } from '../game/GameContext';
import { AudioSystem } from '../systems/AudioSystem';
import { InputSystem } from '../systems/InputSystem';
import { StorageSystem } from '../systems/StorageSystem';

type SpawnedEnemy = Enemy & { meta?: DestroyerData | EnemyData };

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private controls!: InputSystem;
  private audioSystem!: AudioSystem;
  private level = levels[0];
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private hitboxes!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private defeated = 0;
  private runStartAt = 0;
  private runFinished = false;
  private healthText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private cooldownText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private darkOverlay!: Phaser.GameObjects.Rectangle;
  private vignette!: Phaser.GameObjects.Graphics;
  private deepLayer!: Phaser.GameObjects.Container;
  private midLayer!: Phaser.GameObjects.Container;
  private frontLayer!: Phaser.GameObjects.Container;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private playerGlow!: Phaser.GameObjects.Ellipse;
  private enemyShadows = new Map<Enemy, Phaser.GameObjects.Ellipse>();
  private enemyGlows = new Map<Enemy, Phaser.GameObjects.Ellipse>();
  private lastAuraAt = 0;
  private lastTrailAt = 0;
  private attackWindup = false;
  private specialActiveUntil = 0;
  private combo = 0;
  private comboUntil = 0;

  constructor() {
    super('game');
  }

  create(): void {
    const guardian = gameState.selectedGuardian;
    const profile = gameState.selectedProfile;

    if (!guardian || !profile) {
      this.scene.start('title');
      return;
    }

    gameState.currentSession = {
      profile,
      guardian,
      levelId: this.level.id
    };

    this.audioSystem = new AudioSystem(this, gameState.settings);
    this.controls = new InputSystem(this);
    this.audioSystem.playAmbient('forest-bed');
    this.audioSystem.playMusic('gameplay');

    this.buildBackdrop();
    this.buildWorld();

    this.player = new Player(this, 120, 420, guardian);
    this.decoratePlayer();

    this.enemies = this.physics.add.group();
    this.hitboxes = this.physics.add.group();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, (_, enemy) => this.damagePlayer(enemy as SpawnedEnemy), undefined, this);
    this.physics.add.overlap(this.hitboxes, this.enemies, (hitbox, enemy) => {
      this.damageEnemy(enemy as SpawnedEnemy, ((hitbox as Phaser.Physics.Arcade.Sprite).getData('damage') as number) ?? 1);
      hitbox.destroy();
    });

    this.buildHud();
    this.buildTouchControls();

    this.runStartAt = this.time.now;
    this.scheduleWaves();
    this.showMessage(this.level.intro, 2600);
    this.cameras.main.zoomTo(1.04, 240);
    this.time.delayedCall(260, () => this.cameras.main.zoomTo(1, 360));
    this.cameras.main.fadeIn(300, 10, 10, 10);
  }

  private buildBackdrop(): void {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'paper').setDisplaySize(width, height).setAlpha(0.8);

    const sky = this.add.graphics();
    sky.fillGradientStyle(0x24311f, 0x24311f, 0x130f0d, 0x3a2416, 1);
    sky.fillRect(0, 0, width, height);
    sky.setAlpha(0.92);

    this.deepLayer = this.add.container(0, 0);
    this.midLayer = this.add.container(0, 0);
    this.frontLayer = this.add.container(0, 0);

    for (let i = 0; i < 8; i += 1) {
      this.deepLayer.add(this.add.ellipse(20 + i * 60, 140 + i * 28, 140, 300, 0x0d100c, 0.28).setAngle(i % 2 === 0 ? -14 : 10));
    }
    for (let i = 0; i < 10; i += 1) {
      this.midLayer.add(this.add.ellipse(-10 + i * 48, 220 + (i % 4) * 44, 86, 220, 0x2c3a29, 0.2).setAngle(i % 2 === 0 ? 12 : -10));
    }
    for (let i = 0; i < 22; i += 1) {
      this.frontLayer.add(
        this.add
          .ellipse(Phaser.Math.Between(0, width), height - Phaser.Math.Between(60, 150), Phaser.Math.Between(34, 92), Phaser.Math.Between(8, 22), 0x29401f, 0.25)
          .setAngle(Phaser.Math.Between(-12, 12))
      );
    }

    const fox = this.add.graphics();
    fox.fillStyle(0x080807, 0.42);
    fox.fillTriangle(366, 436, 406, 414, 400, 456);
    fox.fillCircle(389, 445, 18);
    fox.fillRect(378, 455, 8, 30);
    fox.fillRect(394, 455, 8, 32);
    this.midLayer.add(fox);

    this.add.particles(0, 0, 'paper', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      lifespan: 6200,
      scale: { start: 0.03, end: 0.003 },
      alpha: { start: 0.08, end: 0 },
      speedX: { min: -2, max: 2 },
      speedY: { min: -5, max: 5 },
      quantity: 1,
      frequency: 260,
      tint: 0xe1d2af
    });

    this.darkOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x060606, 0).setScrollFactor(0).setDepth(70);
    this.vignette = this.add.graphics().setScrollFactor(0).setDepth(69);
    this.vignette.fillStyle(0x000000, 0.18);
    this.vignette.fillEllipse(width / 2, -40, width * 1.35, 220);
    this.vignette.fillEllipse(width / 2, height + 40, width * 1.35, 240);
    this.vignette.fillEllipse(-30, height / 2, 150, height * 1.2);
    this.vignette.fillEllipse(width + 30, height / 2, 150, height * 1.2);
  }

  private buildWorld(): void {
    this.physics.world.setBounds(0, 0, 430, 640);
    this.cameras.main.setBounds(0, 0, 430, 640);
    this.platforms = this.physics.add.staticGroup();
    this.createGround(215, 610, 430, 64);
    this.createGround(90, 450, 120, 18);
    this.createGround(310, 390, 150, 18);
    this.createGround(180, 310, 120, 18);
  }

  private createGround(x: number, y: number, width: number, height: number): void {
    const glow = this.add.ellipse(x, y + 4, width * 0.72, height * 0.8, 0x8cb362, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    const ground = this.add.rectangle(x, y, width, height, 0x32251a, 0.95).setStrokeStyle(2, 0x93815d, 0.82);
    const moss = this.add.rectangle(x, y - height / 2 + 4, width - 12, 8, 0x526740, 0.6);
    this.frontLayer.add([glow, ground, moss]);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
  }

  private decoratePlayer(): void {
    this.playerShadow = this.add.ellipse(this.player.x, this.player.y + 34, 40, 14, 0x000000, 0.22);
    this.playerGlow = this.add.ellipse(this.player.x, this.player.y, 58, 74, this.player.guardian.color, 0.14).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: this.player,
      scaleY: 1.04,
      scaleX: 0.98,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    this.tweens.add({
      targets: this.player,
      y: this.player.y - 4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private buildHud(): void {
    const panel = this.add.container(16, 14).setScrollFactor(0).setDepth(80);
    const glass = this.add.graphics();
    glass.fillStyle(0x120f0d, 0.72);
    glass.lineStyle(2, 0xd4bb8e, 0.55);
    glass.fillRoundedRect(0, 0, 270, 82, 20);
    glass.strokeRoundedRect(0, 0, 270, 82, 20);
    panel.add(glass);

    this.healthText = this.add.text(16, 12, '', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#f5edd8'
    });
    this.scoreText = this.add.text(16, 34, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#f5edd8'
    });
    this.cooldownText = this.add.text(16, 56, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#d5c69f'
    });
    panel.add([this.healthText, this.scoreText, this.cooldownText]);

    this.messageText = this.add.text(215, 98, '', {
      fontFamily: 'Georgia',
      fontSize: '19px',
      color: '#f5edd8',
      align: 'center',
      wordWrap: { width: 320 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(80);
    this.messageText.setShadow(0, 4, '#000000', 10, false, true);

    this.comboText = this.add.text(412, 26, '', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#f6efdd',
      align: 'right'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(80).setAlpha(0);
  }

  private buildTouchControls(): void {
    const { height } = this.scale;
    const joystickBase = this.add.circle(76, height - 82, 42, 0x0b0d0a, 0.28).setStrokeStyle(2, 0xd5c393, 0.45).setScrollFactor(0).setDepth(80);
    const joystickRing = this.add.circle(76, height - 82, 58, 0x000000, 0).setStrokeStyle(1, 0xd5c393, 0.18).setScrollFactor(0).setDepth(80);
    const joystickKnob = this.add.circle(76, height - 82, 23, 0xeadab6, 0.2).setStrokeStyle(2, 0xf6efd9, 0.65).setScrollFactor(0).setDepth(81);
    const joystickZone = this.add.zone(76, height - 82, 132, 132).setScrollFactor(0).setDepth(82);
    this.controls.bindJoystick(joystickZone, joystickKnob, 76, height - 82, 28);

    const makeAction = (
      x: number,
      label: string,
      key: 'jumpPressed' | 'attackPressed' | 'specialPressed',
      fill: number
    ): void => {
      const glow = this.add.circle(x, height - 82, 34, fill, 0.14).setBlendMode(Phaser.BlendModes.ADD).setScrollFactor(0).setDepth(80);
      const outer = this.add.circle(x, height - 82, 28, 0x120f0d, 0.42).setStrokeStyle(2, fill, 0.65).setScrollFactor(0).setDepth(81);
      const labelText = this.add.text(x, height - 82, label, {
        fontFamily: 'Georgia',
        fontSize: '14px',
        color: '#f7efd9'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(82);
      const zone = this.add.zone(x, height - 82, 76, 76).setScrollFactor(0).setDepth(83);
      this.controls.bindActionButton(zone, key, false, {
        onPress: () => {
          outer.setScale(0.92);
          glow.setAlpha(0.26);
        },
        onRelease: () => {
          outer.setScale(1);
          glow.setAlpha(0.14);
        }
      });
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.1, to: 0.18 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
      void labelText;
    };

    makeAction(286, 'Jump', 'jumpPressed', 0x9ec8cf);
    makeAction(352, 'Hit', 'attackPressed', 0xd6b36e);
    makeAction(416, 'Gift', 'specialPressed', 0xa4c96b);
    void joystickBase;
    void joystickRing;
  }

  private scheduleWaves(): void {
    this.level.waves.forEach((wave) => {
      this.time.delayedCall(wave.delay, () => {
        if (!this.runFinished) {
          this.spawnWave(wave);
        }
      });
    });
  }

  private spawnWave(wave: WaveSpawn): void {
    this.showMessage(wave.message, 2200);
    if (wave.type === 'enemy') {
      const enemyData = enemies.find((enemy) => enemy.id === wave.id);
      if (!enemyData) {
        return;
      }
      const count = wave.count ?? 1;
      for (let i = 0; i < count; i += 1) {
        this.time.delayedCall(i * 220, () => this.spawnEnemy(enemyData));
      }
      return;
    }

    const destroyer = destroyers.find((entry) => entry.id === wave.id);
    if (!destroyer) {
      return;
    }

    if (wave.type === 'lion') {
      this.spawnLion(destroyer);
      return;
    }

    this.spawnDestroyer(destroyer);
  }

  private spawnEnemy(enemyData: EnemyData): void {
    const x = Phaser.Math.Between(40, 390);
    const enemy = new Enemy(this, x, 120, `enemy-${enemyData.id}`, {
      id: enemyData.id,
      enemyKind: 'enemy',
      maxHealth: enemyData.maxHealth,
      speed: enemyData.speed,
      damage: enemyData.damage,
      scoreValue: enemyData.scoreValue
    }) as SpawnedEnemy;
    enemy.meta = enemyData;
    enemy.setScale(1.05);
    this.decorateEnemy(enemy, enemyData.color, 1);
    this.enemies.add(enemy);
  }

  private spawnDestroyer(data: DestroyerData): void {
    const enemy = new Enemy(this, Phaser.Math.Between(70, 360), 100, `destroyer-${data.id}`, {
      id: data.id,
      enemyKind: 'destroyer',
      maxHealth: data.maxHealth,
      speed: data.speed,
      damage: data.damage,
      scoreValue: 800
    }) as SpawnedEnemy;
    enemy.meta = data;
    enemy.setScale(data.id === 'orange-destroyer' ? 1.28 : 1.22);
    enemy.setTint(data.color);
    this.decorateEnemy(enemy, data.color, 1.45);
    this.enemies.add(enemy);
    this.cameras.main.shake(240, 0.01);
    this.pulseAura(enemy.x, enemy.y, data.color, 72);
    this.colorGrade(data.id === 'orange-destroyer' ? 0xff8d49 : 0x86c765);
  }

  private spawnLion(data: DestroyerData): void {
    this.audioSystem.playSfx('lion-appearance', { volume: 0.9, rate: 0.85 });
    const lion = new Enemy(this, 340, 120, 'destroyer-lion', {
      id: data.id,
      enemyKind: 'lion',
      maxHealth: data.maxHealth,
      speed: data.speed,
      damage: 0,
      scoreValue: 0
    });
    lion.setImmovable(true);
    (lion.body as Phaser.Physics.Arcade.Body | null)?.setAllowGravity(false);
    lion.setAlpha(0.96);
    this.decorateEnemy(lion, data.color, 1.55);
    this.enemies.add(lion);
    this.darkOverlay.setAlpha(0.2);
    this.cameras.main.zoomTo(1.06, 280);
    this.time.timeScale = 0.55;
    this.physics.world.timeScale = 0.55;
    window.setTimeout(() => {
      this.time.timeScale = 1;
      this.physics.world.timeScale = 1;
      this.cameras.main.zoomTo(1, 380);
      this.tweens.add({ targets: this.darkOverlay, alpha: 0, duration: 520 });
    }, 700);
    this.tweens.add({
      targets: lion,
      y: 175,
      duration: 1100,
      ease: 'Sine.easeOut'
    });
    this.tweens.add({
      targets: this.enemyGlows.get(lion),
      scaleX: 1.22,
      scaleY: 1.18,
      alpha: 0.28,
      duration: 900,
      yoyo: true,
      repeat: 2
    });
    this.time.delayedCall(2800, () => this.removeEnemyDecoration(lion));
    this.time.delayedCall(2800, () => lion.destroy());
  }

  private decorateEnemy(enemy: Enemy, color: number, glowScale: number): void {
    const shadow = this.add.ellipse(enemy.x, enemy.y + 28, 34 * glowScale, 12 * glowScale, 0x000000, 0.22);
    const glow = this.add.ellipse(enemy.x, enemy.y, 48 * glowScale, 56 * glowScale, color, 0.15).setBlendMode(Phaser.BlendModes.ADD);
    this.enemyShadows.set(enemy, shadow);
    this.enemyGlows.set(enemy, glow);
    this.tweens.add({
      targets: enemy,
      y: enemy.y - 4,
      duration: 1200 + Math.random() * 360,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    this.tweens.add({
      targets: enemy,
      scaleX: enemy.scaleX * 0.97,
      scaleY: enemy.scaleY * 1.04,
      duration: 1500 + Math.random() * 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  update(time: number): void {
    if (!this.player || this.runFinished) {
      return;
    }

    const input = this.controls.consumeFrame();
    const speed = this.player.guardian.speed;
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    const currentVelocity = body?.velocity.x ?? 0;
    const targetVelocity = input.moveX * speed;
    this.player.setVelocityX(Phaser.Math.Linear(currentVelocity, targetVelocity, 0.24));

    if (input.moveX < -0.12) {
      this.player.setFlipX(true);
      this.player.facing = -1;
    } else if (input.moveX > 0.12) {
      this.player.setFlipX(false);
      this.player.facing = 1;
    }

    if (body) {
      body.setGravityY(body.velocity.y < 0 ? -70 : body.velocity.y > 0 ? 240 : 0);
      if (input.jumpPressed && body.blocked.down) {
        this.player.setVelocityY(-this.player.guardian.jump);
        this.spawnBurst(this.player.x, this.player.y + 28, 0xe9d9b5, 6, 24);
      }
    }

    if (input.attackPressed && this.player.canAttack(time) && !this.attackWindup) {
      this.startAttackWindup(time);
    }

    if (input.specialPressed && this.player.canSpecial(time)) {
      this.player.lastSpecialAt = time;
      this.activateSpecial();
    }

    this.enemies.children.each((entry) => {
      const enemy = entry as SpawnedEnemy;
      this.updateEnemyBehavior(enemy, time);
      return false;
    });

    this.syncDecorations(time);
    this.updateHud(time);

    const allScheduled = this.time.now - this.runStartAt > 30000;
    if (allScheduled && this.enemies.countActive(true) === 0) {
      this.completeRun(true);
    }
    if (this.player.health <= 0) {
      this.completeRun(false);
    }
  }

  private startAttackWindup(time: number): void {
    this.attackWindup = true;
    this.player.lastAttackAt = time;
    this.tweens.add({
      targets: this.player,
      scaleX: this.player.scaleX * 1.08,
      scaleY: this.player.scaleY * 0.92,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
    this.time.delayedCall(80, () => {
      this.audioSystem.playSfx('attack', { volume: 0.72, rate: Phaser.Math.FloatBetween(0.95, 1.08) });
      this.spawnAttackHitbox(46, this.player.guardian.attackDamage);
      this.spawnBurst(this.player.x + this.player.facing * 28, this.player.y, 0xf4e4c0, 8, 28);
      this.cameras.main.shake(90, 0.004);
      this.attackWindup = false;
    });
  }

  private updateEnemyBehavior(enemy: SpawnedEnemy, time: number): void {
    if (!enemy.active) {
      return;
    }

    if (enemy.enemyKind === 'lion') {
      enemy.setVelocity(0, 0);
      return;
    }

    const dx = this.player.x - enemy.x;
    const direction = Math.sign(dx) || 1;
    const orangeChaos = enemy.id === 'orange-destroyer' ? 42 * Math.sin(time / 130) : 0;
    enemy.setVelocityX(direction * (enemy.speed + orangeChaos));

    const body = enemy.body as Phaser.Physics.Arcade.Body | null;
    if (body?.blocked.down && Math.abs(dx) > 50 && Math.random() < 0.008) {
      enemy.setVelocityY(-240);
    }

    if (time - this.lastAuraAt > 420 && enemy.enemyKind === 'destroyer') {
      if (enemy.id === 'green-destroyer') {
        this.pulseAura(enemy.x, enemy.y, 0x8fd061, 52);
      }
      if (enemy.id === 'orange-destroyer') {
        this.spawnBurst(enemy.x, enemy.y, 0xff9b36, 5, 24);
      }
      if (enemy.id === 'pink-destroyer') {
        this.pulseAura(enemy.x, enemy.y, 0xff78bb, 46);
      }
      this.lastAuraAt = time;
    }
  }

  private spawnAttackHitbox(size: number, damage: number): void {
    const hitbox = this.physics.add.sprite(this.player.x + this.player.facing * 36, this.player.y + 2, 'paper');
    hitbox.setDisplaySize(size, size);
    hitbox.setSize(size, size);
    hitbox.setVisible(false);
    (hitbox.body as Phaser.Physics.Arcade.Body | null)?.setAllowGravity(false);
    hitbox.setData('damage', damage);
    this.hitboxes.add(hitbox);
    this.time.delayedCall(100, () => hitbox.destroy());
  }

  private activateSpecial(): void {
    const type = this.player.guardian.specialType;
    this.specialActiveUntil = this.time.now + 350;

    if (type === 'roots') {
      this.audioSystem.playSfx('root-trap', { volume: 0.78, rate: 0.95 });
      this.enemies.children.each((entry) => {
        const enemy = entry as SpawnedEnemy;
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 126 && enemy.enemyKind !== 'lion') {
          enemy.setTintFill(0x88c774);
          enemy.setVelocityX(0);
          this.time.delayedCall(1200, () => enemy.clearTint());
        }
        return false;
      });
      this.spawnRoots(this.player.x, this.player.y + 28);
      return;
    }

    if (type === 'dash') {
      this.audioSystem.playSfx('wind-dash', { volume: 0.8, rate: 1.08 });
      this.player.invulnerableUntil = this.time.now + 420;
      this.player.setVelocityX(this.player.facing * 440);
      this.spawnAttackHitbox(78, this.player.guardian.attackDamage + 1);
      this.cameras.main.shake(100, 0.004);
      return;
    }

    this.audioSystem.playSfx('slam', { volume: 0.82, rate: 0.92 });
    this.player.setVelocityY(-150);
    this.time.delayedCall(160, () => {
      this.player.setVelocityY(340);
      this.enemies.children.each((entry) => {
        const enemy = entry as SpawnedEnemy;
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 110 && enemy.enemyKind !== 'lion') {
          this.damageEnemy(enemy, this.player.guardian.attackDamage + 2);
        }
        return false;
      });
      this.spawnSpores(this.player.x, this.player.y + 26);
      this.cameras.main.shake(260, 0.012);
    });
  }

  private spawnRoots(x: number, y: number): void {
    for (let i = 0; i < 6; i += 1) {
      const root = this.add.graphics();
      root.lineStyle(3, 0x9fcd71, 0.9);
      root.beginPath();
      root.moveTo(x + (i - 2.5) * 16, y + 26);
      root.lineTo(x + (i - 2.5) * 14 + Phaser.Math.Between(-8, 8), y - Phaser.Math.Between(20, 56));
      root.strokePath();
      this.tweens.add({
        targets: root,
        alpha: 0,
        y: -8,
        duration: 720,
        ease: 'Quad.easeOut',
        onComplete: () => root.destroy()
      });
    }
    this.pulseAura(x, y, 0x9fcd71, 76);
  }

  private spawnSpores(x: number, y: number): void {
    this.spawnBurst(x, y, 0xc6db9d, 16, 60);
    this.pulseAura(x, y, 0xd6f0b5, 88);
  }

  private syncDecorations(time: number): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body | null;
    this.playerShadow.setPosition(this.player.x, this.player.y + 34).setScale(Phaser.Math.Clamp(1 - Math.abs(playerBody?.velocity.y ?? 0) / 900, 0.74, 1.04), 1);
    this.playerGlow.setPosition(this.player.x, this.player.y).setAlpha(time < this.player.invulnerableUntil ? 0.28 : 0.14);
    this.player.setAlpha(time < this.player.invulnerableUntil ? 0.6 : 1);

    this.deepLayer.x = Phaser.Math.Linear(this.deepLayer.x, (215 - this.player.x) * 0.03, 0.03);
    this.midLayer.x = Phaser.Math.Linear(this.midLayer.x, (215 - this.player.x) * 0.05, 0.04);
    this.frontLayer.x = Phaser.Math.Linear(this.frontLayer.x, (215 - this.player.x) * 0.08, 0.05);

    if (this.player.guardian.id === 'aero-finch' && time < this.specialActiveUntil && time - this.lastTrailAt > 45) {
      this.lastTrailAt = time;
      const ghost = this.add.image(this.player.x, this.player.y, this.player.texture.key).setTint(0xbfeff3).setAlpha(0.22).setScale(this.player.scaleX, this.player.scaleY);
      ghost.setFlipX(this.player.flipX);
      this.tweens.add({
        targets: ghost,
        alpha: 0,
        scaleX: ghost.scaleX * 0.84,
        scaleY: ghost.scaleY * 0.84,
        duration: 240,
        onComplete: () => ghost.destroy()
      });
      this.spawnBurst(this.player.x, this.player.y, 0xbfeff3, 4, 16);
    }

    if (this.player.guardian.id === 'mossback' && playerBody?.blocked.down && Math.abs(playerBody.velocity.x) > 40 && Math.random() < 0.15) {
      this.spawnBurst(this.player.x, this.player.y + 28, 0xcfd79f, 2, 12);
    }

    this.enemies.children.each((entry) => {
      const enemy = entry as SpawnedEnemy;
      const shadow = this.enemyShadows.get(enemy);
      const glow = this.enemyGlows.get(enemy);
      if (!shadow || !glow) {
        return false;
      }
      const enemyBody = enemy.body as Phaser.Physics.Arcade.Body | null;
      shadow.setPosition(enemy.x, enemy.y + 28).setScale(Phaser.Math.Clamp(1 - Math.abs(enemyBody?.velocity.y ?? 0) / 900, 0.7, 1.05), 1);
      glow.setPosition(enemy.x, enemy.y);
      if (enemy.id === 'green-destroyer') {
        glow.setFillStyle(0x8fd061, 0.18 + 0.04 * Math.sin(time / 260));
      } else if (enemy.id === 'orange-destroyer') {
        glow.setFillStyle(0xff8f39, 0.18 + 0.05 * Math.sin(time / 180));
      } else if (enemy.id === 'pink-destroyer') {
        glow.setFillStyle(0xff78bb, 0.18 + 0.04 * Math.sin(time / 210));
      }
      return false;
    });
  }

  private damageEnemy(enemy: SpawnedEnemy, amount: number): void {
    if (!enemy.applyDamage(amount, this.time.now)) {
      return;
    }
    this.audioSystem.playSfx('hit', { volume: 0.6, rate: Phaser.Math.FloatBetween(0.92, 1.08) });
    enemy.setTintFill(0xffffff);
    this.tweens.add({
      targets: enemy,
      scaleX: enemy.scaleX * 1.08,
      scaleY: enemy.scaleY * 0.92,
      duration: 90,
      yoyo: true,
      onComplete: () => enemy.clearTint()
    });
    this.spawnBurst(enemy.x, enemy.y, enemy.enemyKind === 'destroyer' ? 0xffd8c2 : 0xf5e5b9, 7, 24);
    if (enemy.health > 0) {
      return;
    }
    this.audioSystem.playSfx('enemy-defeated', { volume: 0.72, rate: Phaser.Math.FloatBetween(0.92, 1.04) });
    this.score += enemy.scoreValue;
    this.combo = Math.min(this.combo + 1, 99);
    this.comboUntil = this.time.now + 2200;
    if (enemy.enemyKind !== 'lion') {
      this.defeated += 1;
    }
    this.spawnScorePopup(enemy.x, enemy.y - 24, `+${enemy.scoreValue}`);
    if (this.combo >= 2) {
      const praise = this.combo >= 6 ? 'Amazing!' : this.combo >= 4 ? 'Great!' : 'Nice!';
      this.spawnScorePopup(enemy.x, enemy.y - 48, praise, '#f9f2bb');
      this.audioSystem.playSfx('score-tally', { volume: 0.06 + Math.min(this.combo, 6) * 0.01, rate: 1 + this.combo * 0.03 });
    }
    this.pulseAura(enemy.x, enemy.y, 0xfff2bf, 34);
    this.removeEnemyDecoration(enemy);
    enemy.destroy();
  }

  private damagePlayer(enemy: SpawnedEnemy): void {
    if (enemy.enemyKind === 'lion') {
      return;
    }
    const damaged = this.player.applyDamage(enemy.damage, this.time.now);
    if (!damaged) {
      return;
    }
    this.audioSystem.playSfx('hit', { volume: 0.76, rate: Phaser.Math.FloatBetween(0.86, 0.98) });
    this.combo = 0;
    this.comboUntil = 0;
    this.player.setTintFill(0xffdfdf);
    this.tweens.add({
      targets: this.player,
      scaleX: this.player.scaleX * 1.08,
      scaleY: this.player.scaleY * 0.92,
      duration: 100,
      yoyo: true,
      onComplete: () => this.player.clearTint()
    });
    this.spawnBurst(this.player.x, this.player.y, 0xffd4cc, 8, 24);
    this.cameras.main.shake(150, 0.007);
  }

  private pulseAura(x: number, y: number, color: number, size: number): void {
    const pulse = this.add.circle(x, y, size * 0.5, color, 0.14).setStrokeStyle(2, color, 0.8).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: pulse,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 420,
      onComplete: () => pulse.destroy()
    });
  }

  private spawnBurst(x: number, y: number, color: number, count: number, spread: number): void {
    for (let i = 0; i < count; i += 1) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(2, 5), color, 0.9);
      dot.setBlendMode(Phaser.BlendModes.ADD);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(spread / 2, spread);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.3,
        duration: 260 + Phaser.Math.Between(0, 120),
        ease: 'Quad.easeOut',
        onComplete: () => dot.destroy()
      });
    }
  }

  private colorGrade(color: number): void {
    const tint = this.add.rectangle(215, 320, 430, 640, color, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: tint,
      alpha: 0,
      duration: 1600,
      onComplete: () => tint.destroy()
    });
  }

  private updateHud(time: number): void {
    this.healthText.setText(`Guardian: ${this.player.guardian.name}`);
    this.scoreText.setText(`Health ${this.player.health}/${this.player.maxHealth}   Score ${this.score}   Defeated ${this.defeated}`);
    const specialReadyIn = Math.max(0, this.player.guardian.specialCooldown - (time - this.player.lastSpecialAt));
    this.cooldownText.setText(specialReadyIn <= 0 ? 'Special ready' : `Special in ${(specialReadyIn / 1000).toFixed(1)}s`);
    if (this.comboUntil > time && this.combo > 1) {
      this.comboText.setText(`${this.combo}x Combo`);
      this.comboText.setAlpha(1);
      this.comboText.setScale(1 + Math.min(this.combo, 8) * 0.03);
    } else {
      this.comboText.setAlpha(0);
    }
  }

  private showMessage(message: string, duration: number): void {
    this.messageText.setText(message);
    this.messageText.setAlpha(1);
    this.messageText.setScale(0.96);
    this.tweens.killTweensOf(this.messageText);
    this.tweens.add({
      targets: this.messageText,
      alpha: 1,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut'
    });
    this.tweens.add({
      targets: this.messageText,
      alpha: 0.16,
      delay: duration,
      duration: 620
    });
  }

  private removeEnemyDecoration(enemy: Enemy): void {
    this.enemyShadows.get(enemy)?.destroy();
    this.enemyGlows.get(enemy)?.destroy();
    this.enemyShadows.delete(enemy);
    this.enemyGlows.delete(enemy);
  }

  private spawnScorePopup(x: number, y: number, text: string, color = '#f6efdd'): void {
    const popup = this.add.text(x, y, text, {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color
    }).setOrigin(0.5).setDepth(95);
    popup.setShadow(0, 4, '#000000', 8, false, true);
    this.tweens.add({
      targets: popup,
      y: y - 26,
      alpha: 0,
      scale: 1.12,
      duration: 520,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy()
    });
  }

  private completeRun(victory: boolean): void {
    if (this.runFinished) {
      return;
    }
    this.runFinished = true;
    const guardian = gameState.selectedGuardian;
    const profile = gameState.selectedProfile;

    if (!guardian || !profile) {
      this.scene.start('title');
      return;
    }

    const record: RunRecord = {
      id: `${Date.now()}`,
      playerName: profile.name,
      guardianId: guardian.id,
      guardianName: guardian.name,
      score: this.score + (victory ? 1000 : 0),
      enemiesDefeated: this.defeated,
      runDurationMs: this.time.now - this.runStartAt,
      levelId: this.level.id,
      createdAt: new Date().toISOString()
    };
    StorageSystem.saveRun(record);
    gameState.latestRun = record;
    this.cameras.main.fadeOut(260, 8, 8, 8);
    this.time.delayedCall(620, () => this.scene.start('score', { victory }));
  }
}
