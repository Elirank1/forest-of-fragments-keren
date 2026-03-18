import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { GameScene } from '../scenes/GameScene';
import { GuardianSelectScene } from '../scenes/GuardianSelectScene';
import { LeaderboardScene } from '../scenes/LeaderboardScene';
import { ProfileScene } from '../scenes/ProfileScene';
import { ScoreScene } from '../scenes/ScoreScene';
import { SettingsScene } from '../scenes/SettingsScene';
import { TitleScene } from '../scenes/TitleScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 430,
    height: 932,
    backgroundColor: '#10120d',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 720, x: 0 },
        debug: false
      }
    },
    scene: [
      BootScene,
      TitleScene,
      ProfileScene,
      GuardianSelectScene,
      GameScene,
      ScoreScene,
      LeaderboardScene,
      SettingsScene
    ]
  });
}
