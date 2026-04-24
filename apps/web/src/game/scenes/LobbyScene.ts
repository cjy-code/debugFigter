import Phaser from "phaser";
import { eventBus } from "../core/eventBus";

/**
 * @date 2026-04-23
 * @desc 게임 시작 안내를 표시하고 스테이지 씬 진입을 처리한다.
 */
export class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  /**
   * @date 2026-04-23
   * @desc 로비 UI를 배치하고 시작 입력을 등록한다.
   */
  create() {
    eventBus.emit("scene:changed", "Lobby");

    this.add
      .text(220, 180, "Debug Fighter MVP", { fontSize: "48px", color: "#f8fafc" })
      .setOrigin(0, 0);
    this.add
      .text(220, 260, "Enter 키를 누르면 런을 시작합니다.", { fontSize: "24px", color: "#cbd5e1" })
      .setOrigin(0, 0);
    this.add
      .text(220, 300, "WASD 이동 / 마우스 시선 추적(화살표 fallback) / SPACE 기본 공격", {
        fontSize: "20px",
        color: "#94a3b8",
      })
      .setOrigin(0, 0);

    this.input.keyboard?.once("keydown-ENTER", () => {
      this.scene.start("StageScene");
    });
  }
}
