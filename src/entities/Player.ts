import Phaser from 'phaser';
import type { GuardianData } from '../data/types';

export class Player extends Phaser.Physics.Arcade.Sprite {
  guardian: GuardianData;
  maxHealth: number;
  health: number;
  lastAttackAt = 0;
  lastSpecialAt = -99999;
  attackCooldown = 320;
  facing: 1 | -1 = 1;
  invulnerableUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, guardian: GuardianData) {
    super(scene, x, y, `guardian-${guardian.id}`);
    this.guardian = guardian;
    this.maxHealth = guardian.maxHealth;
    this.health = guardian.maxHealth;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.02);
    this.setSize(34, 58);
    this.setOffset(15, 8);
  }

  canAttack(now: number): boolean {
    return now - this.lastAttackAt > this.attackCooldown;
  }

  canSpecial(now: number): boolean {
    return now - this.lastSpecialAt > this.guardian.specialCooldown;
  }

  applyDamage(amount: number, now: number): boolean {
    if (now < this.invulnerableUntil) {
      return false;
    }
    this.health = Math.max(0, this.health - amount);
    this.invulnerableUntil = now + 700;
    return true;
  }
}
