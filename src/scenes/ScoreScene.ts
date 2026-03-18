import Phaser from 'phaser';
import { gameState } from '../game/GameContext';
import { buildBackdrop, fadeInScene, transitionToScene } from '../ui/sceneSkin';
import { applyMenuMotion, createButton, createPanel } from '../ui/uiFactory';

export class ScoreScene extends Phaser.Scene {
  constructor() {
    super('score');
  }

  create(data: { victory?: boolean }): void {
    const record = gameState.latestRun;
    const { width, height } = this.scale;
    buildBackdrop(this, {
      top: data.victory ? 0x192618 : 0x281814,
      bottom: 0x0d0d0c,
      haze: data.victory ? 0x8ca860 : 0xb35c3a,
      ember: data.victory ? 0xe0d4a2 : 0xffb47b
    });
    fadeInScene(this);
    const panel = createPanel(this, width / 2, height / 2, width * 0.84, height * 0.72, 0.68);

    const heading = this.add.text(width / 2, 92, data.victory ? 'The Grove Holds... For Now' : 'Game Over', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '30px' : '36px',
      color: '#f4ead5',
      align: 'center'
    }).setOrigin(0.5);
    const items: Phaser.GameObjects.GameObject[] = [panel, heading];

    if (!data.victory) {
      items.push(this.add.text(width / 2, 126, 'The fragments scattered, but the forest remembers.', {
        fontFamily: 'Trebuchet MS',
        fontSize: '16px',
        color: '#d9c1ae',
        align: 'center'
      }).setOrigin(0.5));
    }

    if (record) {
      const lines = [
        `Player: ${record.playerName}`,
        `Guardian: ${record.guardianName}`,
        `Score: ${record.score}`,
        `Enemies defeated: ${record.enemiesDefeated}`,
        `Run duration: ${(record.runDurationMs / 1000).toFixed(1)}s`,
        `Level: ${record.levelId}`
      ];
      items.push(this.add.text(width / 2, height / 2 - 10, lines.join('\n'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '20px',
        color: '#f1e7d2',
        align: 'center',
        lineSpacing: 12
      }).setOrigin(0.5));
    }

    const playAgain = createButton(this, width / 2, height - 150, width * 0.62, 56, 'Play Again', () => transitionToScene(this, 'guardians'), {
      glow: 0x99c96d
    });
    const board = createButton(this, width / 2, height - 88, width * 0.62, 56, 'Leaderboard', () => transitionToScene(this, 'leaderboard'), {
      glow: 0xe0b86f
    });
    const title = createButton(this, width / 2, height - 26, width * 0.62, 46, 'Title', () => transitionToScene(this, 'title'), {
      fontSize: '18px'
    });
    applyMenuMotion(this, [...items, playAgain, board, title], 50);
  }
}
