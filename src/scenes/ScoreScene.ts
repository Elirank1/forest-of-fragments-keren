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
      top: data.victory ? 0xf4efde : 0xf6ece1,
      bottom: data.victory ? 0x8eb07a : 0xc48a70,
      haze: data.victory ? 0xe1ebc8 : 0xf3d3c3,
      ember: data.victory ? 0xf2d98f : 0xffc18e
    });
    fadeInScene(this);
    const panel = createPanel(this, width / 2, height / 2, width * 0.84, height * 0.72, 0.68);

    const heading = this.add.text(width / 2, 92, data.victory ? 'The Grove Holds... For Now' : 'Game Over', {
      fontFamily: 'Georgia',
      fontSize: width < 500 ? '30px' : '36px',
      color: '#253423',
      align: 'center'
    }).setOrigin(0.5);
    const items: Phaser.GameObjects.GameObject[] = [panel, heading];

    if (!data.victory) {
      items.push(this.add.text(width / 2, 126, 'The fragments scattered, but the forest remembers.', {
        fontFamily: 'Trebuchet MS',
        fontSize: '16px',
        color: '#7d6558',
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
        color: '#33452d',
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
