import Phaser from "phaser";
import {
  RESULT_BACK_TO_LOBBY_GUIDE_TEXT,
  RESULT_CLEAR_COUNT_LABEL_TEXT,
  RESULT_RUN_COUNT_LABEL_TEXT,
  RESULT_TITLE_CLEAR_TEXT,
  RESULT_TITLE_FAILED_TEXT,
} from "../constants/textConstants";
import {
  RESULT_BACK_TO_LOBBY_COLOR,
  RESULT_BACK_TO_LOBBY_FONT_SIZE,
  RESULT_BACK_TO_LOBBY_X,
  RESULT_BACK_TO_LOBBY_Y,
  RESULT_CLEAR_COUNT_FONT_SIZE,
  RESULT_CLEAR_COUNT_X,
  RESULT_CLEAR_COUNT_Y,
  RESULT_COMMON_TEXT_COLOR,
  RESULT_RUN_COUNT_FONT_SIZE,
  RESULT_RUN_COUNT_X,
  RESULT_RUN_COUNT_Y,
  RESULT_TITLE_CLEAR_COLOR,
  RESULT_TITLE_FAILED_COLOR,
  RESULT_TITLE_FONT_SIZE,
  RESULT_TITLE_X,
  RESULT_TITLE_Y,
} from "../constants/uiLayoutConstants";
import { eventBus } from "../core/eventBus";
import { SaveService } from "../services/SaveService";
import type { RunResult } from "../shared/gameTypes";

type ResultSceneInitData = {
  result: RunResult;
};

/**
 * @date 2026-04-27
 * @desc 런 결과를 표시하고 누적 런 기록을 저장한다.
 */
export class ResultScene extends Phaser.Scene {
  private result: RunResult = "dead";
  private readonly saveService = new SaveService();

  constructor() {
    super("ResultScene");
  }

  /**
   * @date 2026-04-27
   * @desc 이전 씬에서 전달한 런 결과 값을 반영한다.
   */
  init(data: ResultSceneInitData) {
    this.result = data.result;
  }

  /**
   * @date 2026-04-27
   * @desc 결과 UI를 렌더링하고 로비 복귀 입력을 등록한다.
   */
  create() {
    eventBus.emit("scene:changed", "Result");
    eventBus.emit("run:ended", { result: this.result });

    const recordData = this.saveService.saveRunResult(this.result);
    const titleText = this.result === "clear" ? RESULT_TITLE_CLEAR_TEXT : RESULT_TITLE_FAILED_TEXT;
    const titleColor = this.result === "clear" ? RESULT_TITLE_CLEAR_COLOR : RESULT_TITLE_FAILED_COLOR;

    this.add.text(RESULT_TITLE_X, RESULT_TITLE_Y, titleText, {
      fontSize: RESULT_TITLE_FONT_SIZE,
      color: titleColor,
    });
    this.add.text(RESULT_RUN_COUNT_X, RESULT_RUN_COUNT_Y, `${RESULT_RUN_COUNT_LABEL_TEXT}: ${recordData.runCount}`, {
      fontSize: RESULT_RUN_COUNT_FONT_SIZE,
      color: RESULT_COMMON_TEXT_COLOR,
    });
    this.add.text(RESULT_CLEAR_COUNT_X, RESULT_CLEAR_COUNT_Y, `${RESULT_CLEAR_COUNT_LABEL_TEXT}: ${recordData.clearCount}`, {
      fontSize: RESULT_CLEAR_COUNT_FONT_SIZE,
      color: RESULT_COMMON_TEXT_COLOR,
    });
    this.add.text(RESULT_BACK_TO_LOBBY_X, RESULT_BACK_TO_LOBBY_Y, RESULT_BACK_TO_LOBBY_GUIDE_TEXT, {
      fontSize: RESULT_BACK_TO_LOBBY_FONT_SIZE,
      color: RESULT_BACK_TO_LOBBY_COLOR,
    });

    this.input.keyboard?.once("keydown-R", () => {
      this.scene.start("LobbyScene");
    });
  }
}
