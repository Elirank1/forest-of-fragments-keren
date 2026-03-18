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
  private fragments!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private defeated = 0;
  private fragmentsCollected = 0;
  private fragmentsGoal = 28;
  private roundIndex = -1;
  private roundSpawnsPending = 0;
  private roundActive = false;
  private runStartAt = 0;
  private runFinished = false;
  private healthText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private cooldownText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private fragmentBar!: Phaser.GameObjects.Graphics;
  private fragmentBarGlow!: Phaser.GameObjects.Ellipse;
  private darkOverlay!: Phaser.GameObjects.Rectangle;
  private deepLayer!: Phaser.GameObjects.Container;
  private midLayer!: Phaser.GameObjects.Container;
  private frontLayer!: Phaser.GameObjects.Container;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private playerGlow!: Phaser.GameObjects.Ellipse;
  private enemyShadows = new Map<Enemy, Phaser.GameObjects.Ellipse>();
  private enemyGlows = new Map<Enemy, Phaser.GameObjects.Ellipse>();
  private combo = 0;
  private comboUntil = 0;
  private specialActiveUntil = 0;
  private attackWindup = false;
  private lastTrailAt = 0;
  private lionSeen = false;

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

    this.player = new Player(this, 120, 418, guardian);
    this.decoratePlayer();

    this.enemies = this.physics.add.group();
    this.hitboxes = this.physics.add.group();
    this.fragments = this.physics.add.group();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.fragments, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, (_, enemy) => this.damagePlayer(enemy as SpawnedEnemy), undefined, this);
    this.physics.add.overlap(this.hitboxes, this.enemies, (hitbox, enemy) => {
      this.damageEnemy(enemy as SpawnedEnemy, ((hitbox as Phaser.Physics.Arcade.Sprite).getData('damage') as number) ?? 1);
      hitbox.destroy();
    });
    this.physics.add.overlap(this.player, this.fragments, (_, fragment) => this.collectFragment(fragment as Phaser.Physics.Arcade.Image), undefined, this);

    this.buildHud();
    this.buildTouchControls();

    this.runStartAt = this.time.now;
    this.showMessage('Gather the forest fragments.\nClear each wave and hold the grove.', 2200);
    this.cameras.main.fadeIn(300, 10, 10, 10);
    this.cameras.main.zoomTo(1.04, 220);
    this.time.delayedCall(250, () => this.cameras.main.zoomTo(1, 340));
    this.time.delayedCall(700, () => this.startNextRound());
  }

  private buildBackdrop(): void {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'paper').setDisplaySize(width, height).setAlpha(0.82);

    const sky = this.add.graphics();
    sky.fillGradientStyle(0x213220, 0x213220, 0x15100d, 0x4a2818, 1);
    sky.fillRect(0, 0, width, height);
    sky.setAlpha(0.94);

    this.deepLayer = this.add.container(0, 0);
    this.midLayer = this.add.container(0, 0);
    this.frontLayer = this.add.container(0, 0);

    for (let i = 0; i < 8; i += 1) {
      this.deepLayer.add(this.add.ellipse(25 + i * 60, 140 + i * 28, 140, 300, 0x0d100c, 0.3).setAngle(i % 2 === 0 ? -14 : 10));
    }
    for (let i = 0; i < 10; i += 1) {
      this.midLayer.add(this.add.ellipse(-6 + i * 48, 220 + (i % 4) * 42, 86, 220, 0x2a3b29, 0.22).setAngle(i % 2 === 0 ? 12 : -10));
    }
    for (let i = 0; i < 22; i += 1) {
      this.frontLayer.add(
        this.add
          .ellipse(Phaser.Math.Between(0, width), height - Phaser.Math.Between(56, 150), Phaser.Math.Between(34, 92), Phaser.Math.Between(8, 22), 0x2a431f, 0.27)
          .setAngle(Phaser.Math.Between(-12, 12))
      );
    }

    const fog = this.add.rectangle(width / 2, height * 0.62, width, height * 0.34, 0xc9ddb6, 0.06);
    this.tweens.add({
      targets: fog,
      alpha: { from: 0.03, to: 0.08 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.add.particles(0, 0, 'paper', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      lifespan: 5600,
      scale: { start: 0.03, end: 0.003 },
      alpha: { start: 0.08, end: 0 },
      speedX: { min: -2, max: 2 },
      speedY: { min: -5, max: 5 },
      quantity: 1,
      frequency: 260,
      tint: 0xe1d2af
    });

    this.darkOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x060606, 0).setScrollFactor(0).setDepth(90);
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
    this.playerShadow = this.add.ellipse(this.player.x, this.player.y + 34, 42, 14, 0x000000, 0.22);
    this.playerGlow = this.add.ellipse(this.player.x, this.player.y, 62, 78, this.player.guardian.color, 0.14).setBlendMode(Phaser.BlendModes.ADD);
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
    const panel = this.add.container(16, 12).setScrollFactor(0).setDepth(100);
    const glass = this.add.graphics();
    glass.fillStyle(0x120f0d, 0.76);
    glass.lineStyle(2, 0xd4bb8e, 0.55);
    glass.fillRoundedRect(0, 0, 278, 92, 20);
    glass.strokeRoundedRect(0, 0, 278, 92, 20);
    panel.add(glass);

    this.roundText = this.add.text(16, 10, '', {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#f5edd8'
    });
    this.healthText = this.add.text(16, 32, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#f5edd8'
    });
    this.scoreText = this.add.text(16, 52, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#f5edd8'
    });
    this.cooldownText = this.add.text(16, 72, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#d5c69f'
    });
    panel.add([this.roundText, this.healthText, this.scoreText, this.cooldownText]);

    this.fragmentBarGlow = this.add.ellipse(350, 28, 90, 18, 0xa4d274, 0.16).setBlendMode(Phaser.BlendModes.ADD).setScrollFactor(0).setDepth(99);
    this.fragmentBar = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.comboText = this.add.text(412, 46, '', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#f7efd9'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setAlpha(0);

    this.messageText = this.add.text(215, 108, '', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#f5edd8',
      align: 'center',
      wordWrap: { width: 330 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.messageText.setShadow(0, 4, '#000000', 10, false, true);
  }

  private buildTouchControls(): void {
    const { height } = this.scale;
    const joystickKnob = this.add.circle(76, height - 82, 24, 0xeadab6, 0.22).setStrokeStyle(2, 0xf6efd9, 0.7).setScrollFactor(0).setDepth(101);
    this.add.circle(76, height - 82, 44, 0x0b0d0a, 0.32).setStrokeStyle(2, 0xd5c393, 0.5).setScrollFactor(0).setDepth(100);
    this.add.circle(76, height - 82, 60, 0x000000, 0).setStrokeStyle(1, 0xd5c393, 0.18).setScrollFactor(0).setDepth(100);
    const joystickZone = this.add.zone(76, height - 82, 136, 136).setScrollFactor(0).setDepth(102);
    this.controls.bindJoystick(joystickZone, joystickKnob, 76, height - 82, 30);

    const makeAction = (
      x: number,
      label: string,
      key: 'jumpPressed' | 'attackPressed' | 'specialPressed',
      fill: number
    ): void => {
      const glow = this.add.circle(x, height - 82, 36, fill, 0.15).setBlendMode(Phaser.BlendModes.ADD).setScrollFactor(0).setDepth(100);
      const outer = this.add.circle(x, height - 82, 30, 0x120f0d, 0.48).setStrokeStyle(2, fill, 0.7).setScrollFactor(0).setDepth(101);
      this.add.text(x, height - 82, label, {
        fontFamily: 'Georgia',
        fontSize: '14px',
        color: '#f7efd9'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
      const zone = this.add.zone(x, height - 82, 84, 84).setScrollFactor(0).setDepth(103);
      this.controls.bindActionButton(zone, key, false, {
        onPress: () => {
          outer.setScale(0.9);
          glow.setAlpha(0.28);
        },
        onRelease: () => {
          outer.setScale(1);
          glow.setAlpha(0.15);
        }
      });
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.11, to: 0.18 },
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    };

    makeAction(284, 'Jump', 'jumpPressed', 0x9ec8cf);
    makeAction(350, 'Hit', 'attackPressed', 0xd6b36e);
    makeAction(416, 'Gift', 'specialPressed', 0xa4c96b);
  }

  private startNextRound(): void {
    if (this.runFinished) {
      return;
    }

    this.roundIndex += 1;
    if (this.roundIndex >= this.level.waves.length) {
      this.completeRun(true);
      return;
    }

    const wave = this.level.waves[this.roundIndex];
    this.roundActive = true;
    this.roundSpawnsPending = 0;
    this.showMessage(wave.message, 1800);
    this.spawnRound(wave);
  }

  private spawnRound(wave: WaveSpawn): void {
    if (wave.type === 'lion') {
      this.spawnLionMoment();
      this.time.delayedCall(3200, () => {
        this.roundActive = false;
        this.startNextRound();
      });
      return;
    }

    if (wave.type === 'enemy') {
      const enemyData = enemies.find((entry) => entry.id === wave.id) ?? enemies[0];
      const count = wave.count ?? 1;
      this.roundSpawnsPending = count;
      for (let i = 0; i < count; i += 1) {
        this.time.delayedCall(i * 260, () => {
          this.spawnEnemy(enemyData);
          this.roundSpawnsPending -= 1;
        });
      }
      return;
    }

    const destroyer = destroyers.find((entry) => entry.id === wave.id) ?? destroyers[0];
    this.roundSpawnsPending = 1;
    this.time.delayedCall(200, () => {
      this.spawnDestroyer(destroyer);
      this.roundSpawnsPending = 0;
      const minionCount = destroyer.id === 'orange-destroyer' ? 3 : 2;
      for (let i = 0; i < minionCount; i += 1) {
        this.time.delayedCall(450 + i * 220, () => this.spawnEnemy(enemies[i % enemies.length]));
      }
    });
  }

  private spawnEnemy(enemyData: EnemyData): void {
    const x = Phaser.Math.Between(50, 380);
    const enemy = new Enemy(this, x, 120, `enemy-${enemyData.id}`, {
      id: enemyData.id,
      enemyKind: 'enemy',
      maxHealth: enemyData.maxHealth,
      speed: enemyData.speed,
      damage: enemyData.damage,
      scoreValue: enemyData.scoreValue
    }) as SpawnedEnemy;
    enemy.meta = enemyData;
    enemy.setScale(1.06);
    this.decorateEnemy(enemy, enemyData.color, 1);
    this.enemies.add(enemy);
  }

  private spawnDestroyer(data: DestroyerData): void {
    const enemy = new Enemy(this, Phaser.Math.Between(80, 350), 100, `destroyer-${data.id}`, {
      id: data.id,
      enemyKind: 'destroyer',
      maxHealth: data.maxHealth,
      speed: data.speed,
      damage: data.damage,
      scoreValue: 900
    }) as SpawnedEnemy;
    enemy.meta = data;
    enemy.setScale(data.id === 'orange-destroyer' ? 1.3 : 1.24);
    enemy.setTint(data.color);
    this.decorateEnemy(enemy, data.color, 1.5);
    this.enemies.add(enemy);
    this.pulseAura(enemy.x, enemy.y, data.color, 74);
    this.cameras.main.shake(260, 0.011);
  }

  private spawnLionMoment(): void {
    if (this.lionSeen) {
      return;
    }
    this.lionSeen = true;
    const lionData = destroyers.find((entry) => entry.id === 'lion');
    if (!lionData) {
      return;
    }
    const lion = new Enemy(this, 340, 120, 'destroyer-lion', {
      id: lionData.id,
      enemyKind: 'lion',
      maxHealth: lionData.maxHealth,
      speed: 0,
      damage: 0,
      scoreValue: 0
    });
    lion.setImmovable(true);
    (lion.body as Phaser.Physics.Arcade.Body | null)?.setAllowGravity(false);
    lion.setAlpha(0.97);
    this.decorateEnemy(lion, lionData.color, 1.7);
    this.enemies.add(lion);

    this.audioSystem.playSfx('lion-appearance', { volume: 0.08, rate: 0.86 });
    this.darkOverlay.setAlpha(0.24);
    this.time.timeScale = 0.55;
    this.physics.world.timeScale = 0.55;
    this.cameras.main.zoomTo(1.08, 250);
    this.tweens.add({
      targets: lion,
      y: 176,
      duration: 1050,
      ease: 'Sine.easeOut'
    });
    this.showMessage('The Lion watches.\nNothing whole stays whole.', 2300);

    this.time.delayedCall(700, () => {
      this.time.timeScale = 1;
      this.physics.world.timeScale = 1;
      this.cameras.main.zoomTo(1, 360);
      this.tweens.add({ targets: this.darkOverlay, alpha: 0, duration: 500 });
    });
    this.time.delayedCall(2900, () => {
      this.removeEnemyDecoration(lion);
      lion.destroy();
    });
  }

  private decorateEnemy(enemy: Enemy, color: number, glowScale: number): void {
    const shadow = this.add.ellipse(enemy.x, enemy.y + 28, 34 * glowScale, 12 * glowScale, 0x000000, 0.22);
    const glow = this.add.ellipse(enemy.x, enemy.y, 50 * glowScale, 60 * glowScale, color, 0.16).setBlendMode(Phaser.BlendModes.ADD);
    this.enemyShadows.set(enemy, shadow);
    this.enemyGlows.set(enemy, glow);
    this.tweens.add({
      targets: enemy,
      y: enemy.y - 4,
      duration: 1200 + Math.random() * 280,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    this.tweens.add({
      targets: enemy,
      scaleX: enemy.scaleX * 0.98,
      scaleY: enemy.scaleY * 1.04,
      duration: 1400 + Math.random() * 260,
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
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    const moveSpeed = this.player.guardian.speed;
    const targetVelocity = input.moveX * moveSpeed;
    const currentVelocity = body?.velocity.x ?? 0;
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

    if (this.roundActive && this.roundSpawnsPending <= 0 && this.countHostiles() === 0) {
      this.finishRound();
    }

    this.syncDecorations(time);
    this.updateHud(time);

    if (this.player.health <= 0) {
      this.completeRun(false);
    }
  }

  private countHostiles(): number {
    let count = 0;
    this.enemies.children.each((entry) => {
      const enemy = entry as SpawnedEnemy;
      if (enemy.active && enemy.enemyKind !== 'lion') {
        count += 1;
      }
      return false;
    });
    return count;
  }

  private finishRound(): void {
    this.roundActive = false;
    const praise = this.roundIndex >= this.level.waves.length - 2 ? 'Brilliant!' : this.roundIndex >= 3 ? 'Great!' : 'Nice!';
    this.showMessage(`${praise}\nThe grove brightens.`, 1100);
    this.audioSystem.playSfx('score-tally', { volume: 0.06, rate: 1.06 });
    this.score += 250;
    this.time.delayedCall(1200, () => this.startNextRound());
  }

  private startAttackWindup(time: number): void {
    this.attackWindup = true;
    this.player.lastAttackAt = time;
    this.tweens.add({
      targets: this.player,
      scaleX: this.player.scaleX * 1.1,
      scaleY: this.player.scaleY * 0.92,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
    this.time.delayedCall(80, () => {
      this.audioSystem.playSfx('attack', { volume: 0.04, rate: Phaser.Math.FloatBetween(0.96, 1.08) });
      this.spawnAttackHitbox(48, this.player.guardian.attackDamage);
      this.spawnBurst(this.player.x + this.player.facing * 30, this.player.y, 0xf4e4c0, 8, 28);
      this.cameras.main.shake(110, 0.005);
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
    const extraChaos = enemy.id === 'orange-destroyer' ? 44 * Math.sin(time / 130) : 0;
    enemy.setVelocityX(direction * (enemy.speed + extraChaos));

    const body = enemy.body as Phaser.Physics.Arcade.Body | null;
    if (body?.blocked.down && Math.abs(dx) > 58 && Math.random() < 0.008) {
      enemy.setVelocityY(-240);
    }

    const glow = this.enemyGlows.get(enemy);
    if (glow) {
      if (enemy.id === 'green-destroyer') {
        glow.setFillStyle(0x8fd061, 0.18 + 0.04 * Math.sin(time / 250));
      } else if (enemy.id === 'orange-destroyer') {
        glow.setFillStyle(0xff8f39, 0.18 + 0.05 * Math.sin(time / 180));
      } else if (enemy.id === 'pink-destroyer') {
        glow.setFillStyle(0xff78bb, 0.18 + 0.04 * Math.sin(time / 220));
      }
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
    this.specialActiveUntil = this.time.now + 360;

    if (type === 'roots') {
      this.audioSystem.playSfx('root-trap', { volume: 0.05, rate: 0.96 });
      this.enemies.children.each((entry) => {
        const enemy = entry as SpawnedEnemy;
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 132 && enemy.enemyKind !== 'lion') {
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
      this.audioSystem.playSfx('wind-dash', { volume: 0.05, rate: 1.06 });
      this.player.invulnerableUntil = this.time.now + 420;
      this.player.setVelocityX(this.player.facing * 450);
      this.spawnAttackHitbox(80, this.player.guardian.attackDamage + 1);
      this.cameras.main.shake(120, 0.004);
      return;
    }

    this.audioSystem.playSfx('slam', { volume: 0.06, rate: 0.92 });
    this.player.setVelocityY(-150);
    this.time.delayedCall(170, () => {
      this.player.setVelocityY(360);
      this.enemies.children.each((entry) => {
        const enemy = entry as SpawnedEnemy;
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 114 && enemy.enemyKind !== 'lion') {
          this.damageEnemy(enemy, this.player.guardian.attackDamage + 2);
        }
        return false;
      });
      this.spawnSpores(this.player.x, this.player.y + 26);
      this.cameras.main.shake(270, 0.013);
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
    this.pulseAura(x, y, 0x9fcd71, 78);
  }

  private spawnSpores(x: number, y: number): void {
    this.spawnBurst(x, y, 0xc6db9d, 18, 62);
    this.pulseAura(x, y, 0xd6f0b5, 90);
  }

  private damageEnemy(enemy: SpawnedEnemy, amount: number): void {
    if (!enemy.applyDamage(amount, this.time.now)) {
      return;
    }
    this.audioSystem.playSfx('hit', { volume: 0.04, rate: Phaser.Math.FloatBetween(0.93, 1.08) });
    enemy.setTintFill(0xffffff);
    this.tweens.add({
      targets: enemy,
      scaleX: enemy.scaleX * 1.1,
      scaleY: enemy.scaleY * 0.92,
      duration: 100,
      yoyo: true,
      onComplete: () => enemy.clearTint()
    });
    this.spawnBurst(enemy.x, enemy.y, enemy.enemyKind === 'destroyer' ? 0xffd8c2 : 0xf5e5b9, 8, 26);

    if (enemy.health > 0) {
      this.spawnScorePopup(enemy.x, enemy.y - 24, `${amount}`);
      return;
    }

    this.score += enemy.scoreValue;
    this.combo = Math.min(this.combo + 1, 99);
    this.comboUntil = this.time.now + 2200;
    if (enemy.enemyKind !== 'lion') {
      this.defeated += 1;
    }
    this.spawnScorePopup(enemy.x, enemy.y - 22, `+${enemy.scoreValue}`);
    if (this.combo >= 2) {
      const praise = this.combo >= 6 ? 'Amazing!' : this.combo >= 4 ? 'Great!' : 'Nice!';
      this.spawnScorePopup(enemy.x, enemy.y - 48, praise, '#f9f2bb');
      this.audioSystem.playSfx('score-tally', { volume: 0.05, rate: 1 + this.combo * 0.03 });
    }
    this.dropFragments(enemy.x, enemy.y, enemy.enemyKind === 'destroyer' ? 4 : 2);
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
    this.combo = 0;
    this.comboUntil = 0;
    this.audioSystem.playSfx('hit', { volume: 0.06, rate: Phaser.Math.FloatBetween(0.86, 0.98) });
    this.player.setTintFill(0xffdfdf);
    this.tweens.add({
      targets: this.player,
      scaleX: this.player.scaleX * 1.08,
      scaleY: this.player.scaleY * 0.92,
      duration: 110,
      yoyo: true,
      onComplete: () => this.player.clearTint()
    });
    this.spawnBurst(this.player.x, this.player.y, 0xffd4cc, 9, 26);
    this.cameras.main.shake(180, 0.008);
  }

  private dropFragments(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i += 1) {
      const fragment = this.physics.add.image(x, y, 'paper');
      fragment.setDisplaySize(14, 14);
      fragment.setTint(0xf3efb9);
      fragment.setBlendMode(Phaser.BlendModes.ADD);
      fragment.setCircle(7);
      fragment.setBounce(0.8);
      fragment.setVelocity(Phaser.Math.Between(-120, 120), Phaser.Math.Between(-230, -120));
      fragment.setDrag(35, 0);
      fragment.setData('value', 1);
      this.fragments.add(fragment);
      this.time.delayedCall(5000, () => fragment.active && fragment.destroy());
    }
  }

  private collectFragment(fragment: Phaser.Physics.Arcade.Image): void {
    if (!fragment.active) {
      return;
    }
    fragment.destroy();
    this.fragmentsCollected += 1;
    this.score += 40;
    this.spawnScorePopup(this.player.x, this.player.y - 48, '+1 Fragment', '#dff2a0');
    this.audioSystem.playSfx('score-tally', { volume: 0.035, rate: 1.2 });
    if (this.fragmentsCollected >= this.fragmentsGoal && this.roundIndex >= this.level.waves.length - 1 && this.countHostiles() === 0) {
      this.completeRun(true);
    }
  }

  private syncDecorations(time: number): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body | null;
    this.playerShadow
      .setPosition(this.player.x, this.player.y + 34)
      .setScale(Phaser.Math.Clamp(1 - Math.abs(playerBody?.velocity.y ?? 0) / 900, 0.74, 1.04), 1);
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

    this.enemies.children.each((entry) => {
      const enemy = entry as SpawnedEnemy;
      const shadow = this.enemyShadows.get(enemy);
      const glow = this.enemyGlows.get(enemy);
      const body = enemy.body as Phaser.Physics.Arcade.Body | null;
      if (!shadow || !glow) {
        return false;
      }
      shadow.setPosition(enemy.x, enemy.y + 28).setScale(Phaser.Math.Clamp(1 - Math.abs(body?.velocity.y ?? 0) / 900, 0.7, 1.05), 1);
      glow.setPosition(enemy.x, enemy.y);
      return false;
    });
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

  private updateHud(time: number): void {
    this.roundText.setText(`Round ${Math.min(this.roundIndex + 1, this.level.waves.length)} / ${this.level.waves.length}`);
    this.healthText.setText(`Health ${this.player.health}/${this.player.maxHealth}   Fragments ${this.fragmentsCollected}/${this.fragmentsGoal}`);
    this.scoreText.setText(`Score ${this.score}   Defeated ${this.defeated}`);
    const specialReadyIn = Math.max(0, this.player.guardian.specialCooldown - (time - this.player.lastSpecialAt));
    this.cooldownText.setText(specialReadyIn <= 0 ? 'Special ready' : `Special in ${(specialReadyIn / 1000).toFixed(1)}s`);

    this.fragmentBar.clear();
    this.fragmentBar.fillStyle(0x18130f, 0.78);
    this.fragmentBar.fillRoundedRect(305, 20, 106, 14, 7);
    this.fragmentBar.lineStyle(2, 0xd7c08f, 0.7);
    this.fragmentBar.strokeRoundedRect(305, 20, 106, 14, 7);
    this.fragmentBar.fillStyle(0xa4d274, 0.95);
    this.fragmentBar.fillRoundedRect(307, 22, 102 * Phaser.Math.Clamp(this.fragmentsCollected / this.fragmentsGoal, 0, 1), 10, 5);
    this.fragmentBarGlow.setAlpha(0.08 + 0.18 * Phaser.Math.Clamp(this.fragmentsCollected / this.fragmentsGoal, 0, 1));

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
      alpha: 0.14,
      delay: duration,
      duration: 620
    });
  }

  private spawnScorePopup(x: number, y: number, text: string, color = '#f6efdd'): void {
    const popup = this.add.text(x, y, text, {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color
    }).setOrigin(0.5).setDepth(110);
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

  private removeEnemyDecoration(enemy: Enemy): void {
    this.enemyShadows.get(enemy)?.destroy();
    this.enemyGlows.get(enemy)?.destroy();
    this.enemyShadows.delete(enemy);
    this.enemyGlows.delete(enemy);
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

    const bonus = victory ? 1200 + this.fragmentsCollected * 35 : this.fragmentsCollected * 20;
    const record: RunRecord = {
      id: `${Date.now()}`,
      playerName: profile.name,
      guardianId: guardian.id,
      guardianName: guardian.name,
      score: this.score + bonus,
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
