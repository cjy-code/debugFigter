import Phaser from "phaser";
import { eventBus } from "../core/eventBus";
import { SaveService } from "../services/SaveService";
import type { RunResult } from "../shared/gameTypes";

type ResultSceneInitData = {
  result: RunResult;
};

/**
 * @date 2026-04-23
 * @desc 런 결과를 표시하고 영구 성장 데이터를 저장한다.
 */
export class ResultScene extends Phaser.Scene {
  private result: RunResult = "dead";
  private readonly saveService = new SaveService();

  constructor() {
    super("ResultScene");
  }

  /**
   * @date 2026-04-23
   * @desc 이전 씬에서 전달한 결과 값을 저장한다.
   */
  init(data: ResultSceneInitData) {
    this.result = data.result;
  }

  /**
   * @date 2026-04-23
   * @desc 결과 UI 렌더링과 재시작 입력 처리를 수행한다.
   */
  create() {
    eventBus.emit("scene:changed", "Result");
    eventBus.emit("run:ended", { result: this.result });

    const progressionData = this.saveService.saveRunResult(this.result);
    const titleText = this.result === "clear" ? "RUN CLEAR" : "RUN FAILED";
    const titleColor = this.result === "clear" ? "#4ade80" : "#f87171";

    this.add.text(300, 160, titleText, { fontSize: "56px", color: titleColor });
    this.add.text(280, 260, `누적 런 횟수: ${progressionData.runCount}`, {
      fontSize: "30px",
      color: "#e2e8f0",
    });
    this.add.text(280, 310, `클리어 횟수: ${progressionData.clearCount}`, {
      fontSize: "30px",
      color: "#e2e8f0",
    });
    this.add.text(280, 360, `영구 공격 보너스: +${progressionData.bonusAttack}`, {
      fontSize: "30px",
      color: "#e2e8f0",
    });
    this.add.text(280, 430, "R 키로 로비 복귀", { fontSize: "24px", color: "#94a3b8" });

    this.input.keyboard?.once("keydown-R", () => {
      this.scene.start("LobbyScene");
    });
  }
}
