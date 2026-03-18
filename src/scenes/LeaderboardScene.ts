import Phaser from 'phaser';
import { gameState } from '../game/GameContext';
import { StorageSystem } from '../systems/StorageSystem';
import { buildBackdrop, fadeInScene, transitionToScene } from '../ui/sceneSkin';
import { applyMenuMotion, createButton, createPanel } from '../ui/uiFactory';
import { guardians } from '../data/guardians';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('leaderboard');
  }

  create(): void {
    const scores = StorageSystem.getLeaderboard().slice(0, 8);
    const { width, height } = this.scale;
    buildBackdrop(this, {
      top: 0x20170f,
      bottom: 0x0f0f0d,
      haze: 0x9d7844,
      ember: 0xf2d08d
    });
    fadeInScene(this);
    const panel = createPanel(this, width / 2, height / 2, width * 0.88, height * 0.82, 0.7);
    const heading = this.add.text(width / 2, 58, 'Local Leaderboard', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '30px' : '36px',
      color: '#f5edd8'
    }).setOrigin(0.5);
    const caption = this.add.text(width / 2, 88, 'Fragments remembered by the family grove', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#d4c29e'
    }).setOrigin(0.5);
    const items: Phaser.GameObjects.GameObject[] = [panel, heading, caption];

    if (scores.length === 0) {
      const empty = this.add.text(width / 2, height / 2, 'No fragments recorded yet.\nPlay a run to begin the family leaderboard.', {
        fontFamily: 'Trebuchet MS',
        fontSize: '20px',
        color: '#efe3cd',
        align: 'center'
      }).setOrigin(0.5);
      items.push(empty);
    } else {
      scores.forEach((record, index) => {
        const guardian = guardians.find((entry) => entry.id === record.guardianId);
        const y = 138 + index * 64;
        const isCurrent = gameState.latestRun?.id === record.id;
        const rowGlow = this.add.ellipse(width / 2, y + 12, width * 0.76, 50, isCurrent ? 0x98c96d : 0xd0aa6c, isCurrent ? 0.18 : 0.08)
          .setBlendMode(Phaser.BlendModes.ADD);
        const row = this.add.rectangle(width / 2, y + 12, width * 0.8, 54, 0x17120e, 0.74).setStrokeStyle(2, isCurrent ? 0x98c96d : 0xb99d71, 0.72);
        const badge = this.add.circle(58, y + 12, 18, guardian?.color ?? 0xd8c090, 0.95);
        const rank = this.add.text(58, y + 12, `${index + 1}`, {
          fontFamily: 'Georgia',
          fontSize: '16px',
          color: '#17120f'
        }).setOrigin(0.5);
        const player = this.add.text(92, y - 2, record.playerName, {
          fontFamily: 'Georgia',
          fontSize: '19px',
          color: isCurrent ? '#f7f4df' : '#f3e7d2'
        });
        const detail = this.add.text(92, y + 18, `${record.guardianName}  •  ${record.enemiesDefeated} defeated  •  ${(record.runDurationMs / 1000).toFixed(1)}s`, {
          fontFamily: 'Trebuchet MS',
          fontSize: '12px',
          color: '#cbb89b'
        });
        const score = this.add.text(width - 42, y + 10, `${record.score}`, {
          fontFamily: 'Georgia',
          fontSize: '24px',
          color: '#f5edd8'
        }).setOrigin(1, 0.5);
        items.push(rowGlow, row, badge, rank, player, detail, score);
      });
    }

    const footer = this.add.text(width / 2, height - 112, 'Structured for future online leaderboard sync.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#ccb792'
    }).setOrigin(0.5);
    const back = createButton(this, width / 2, height - 54, width * 0.56, 50, 'Back', () => transitionToScene(this, 'title'));
    applyMenuMotion(this, [...items, footer, back], 28);
  }
}
