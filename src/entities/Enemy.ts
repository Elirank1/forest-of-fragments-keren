import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  id: string;
  enemyKind: 'enemy' | 'destroyer' | 'lion';
  maxHealth: number;
  health: number;
  speed: number;
  damage: number;
  scoreValue: number;
  lastHitAt = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: {
      id: string;
      enemyKind: 'enemy' | 'destroyer' | 'lion';
      maxHealth: number;
      speed: number;
      damage: number;
      scoreValue: number;
    }
  ) {
    super(scene, x, y, texture);
    this.id = config.id;
    this.enemyKind = config.enemyKind;
    this.maxHealth = config.maxHealth;
    this.health = config.maxHealth;
    this.speed = config.speed;
    this.damage = config.damage;
    this.scoreValue = config.scoreValue;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounce(0.02);
    this.setCollideWorldBounds(true);
  }

  applyDamage(amount: number, now: number): boolean {
    if (now - this.lastHitAt < 120) {
      return false;
    }
    this.health = Math.max(0, this.health - amount);
    this.lastHitAt = now;
    return true;
  }
}
