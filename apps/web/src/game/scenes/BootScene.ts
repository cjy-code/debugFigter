import Phaser from "phaser";
import { eventBus } from "../core/eventBus";

/**
 * @date 2026-04-23
 * @desc 게임 최초 진입 시 리소스 준비 후 로비 씬으로 전환한다.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  /**
   * @date 2026-04-23
   * @desc 부트 씬 생성 직후 로비로 이동한다.
   */
  create() {
    eventBus.emit("scene:changed", "Boot");
    this.scene.start("LobbyScene");
  }
}
