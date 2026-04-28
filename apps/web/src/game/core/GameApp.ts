import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants/gameConstants";
import { BootScene } from "../scenes/BootScene";
import { CharacterSelectScene } from "../scenes/CharacterSelectScene";
import { LobbyScene } from "../scenes/LobbyScene";
import { ResultScene } from "../scenes/ResultScene";
import { StageScene } from "../scenes/StageScene";

/**
 * @date 2026-04-23
 * @desc Phaser 인스턴스 생명주기와 루트 연결을 관리한다.
 */
export class GameApp {
  private gameInstance: Phaser.Game | undefined;

  constructor(private readonly containerId: string) {}

  /**
   * @date 2026-04-23
   * @desc Phaser 게임 인스턴스를 생성하고 씬을 초기화한다.
   */
  start() {
    if (this.gameInstance) {
      return;
    }

    this.gameInstance = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: this.containerId,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      backgroundColor: "#0f172a",
      scene: [BootScene, LobbyScene, CharacterSelectScene, StageScene, ResultScene],
    });
  }

  /**
   * @date 2026-04-23
   * @desc Phaser 게임 인스턴스를 종료하고 메모리를 해제한다.
   */
  destroy() {
    if (!this.gameInstance) {
      return;
    }

    this.gameInstance.destroy(true);
    this.gameInstance = undefined;
  }
}
