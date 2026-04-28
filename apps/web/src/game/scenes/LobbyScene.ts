import Phaser from "phaser";
import { FINAL_BOSS_PHASE } from "../constants/gameConstants";
import {
  APP_TITLE_TEXT,
  LOBBY_CONTROL_GUIDE_TEXT,
  LOBBY_START_GUIDE_TEXT,
  createLobbyGoalText,
} from "../constants/textConstants";
import {
  LOBBY_CONTROL_GUIDE_COLOR,
  LOBBY_CONTROL_GUIDE_FONT_SIZE,
  LOBBY_CONTROL_GUIDE_X,
  LOBBY_CONTROL_GUIDE_Y,
  LOBBY_GOAL_GUIDE_COLOR,
  LOBBY_GOAL_GUIDE_FONT_SIZE,
  LOBBY_GOAL_GUIDE_X,
  LOBBY_GOAL_GUIDE_Y,
  LOBBY_START_GUIDE_COLOR,
  LOBBY_START_GUIDE_FONT_SIZE,
  LOBBY_START_GUIDE_X,
  LOBBY_START_GUIDE_Y,
  LOBBY_TITLE_COLOR,
  LOBBY_TITLE_FONT_SIZE,
  LOBBY_TITLE_X,
  LOBBY_TITLE_Y,
} from "../constants/uiLayoutConstants";
import { eventBus } from "../core/eventBus";

/**
 * @date 2026-04-27
 * @desc 게임 로비 안내를 표시하고 캐릭터 선택 씬으로 이동시킨다.
 */
export class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  /**
   * @date 2026-04-27
   * @desc 로비 UI를 표시하고 Enter 입력으로 캐릭터 선택 씬으로 진입시킨다.
   */
  create() {
    eventBus.emit("scene:changed", "Lobby");

    this.add.text(LOBBY_TITLE_X, LOBBY_TITLE_Y, APP_TITLE_TEXT, {
      fontSize: LOBBY_TITLE_FONT_SIZE,
      color: LOBBY_TITLE_COLOR,
    });
    this.add.text(LOBBY_START_GUIDE_X, LOBBY_START_GUIDE_Y, LOBBY_START_GUIDE_TEXT, {
      fontSize: LOBBY_START_GUIDE_FONT_SIZE,
      color: LOBBY_START_GUIDE_COLOR,
    });
    this.add.text(LOBBY_CONTROL_GUIDE_X, LOBBY_CONTROL_GUIDE_Y, LOBBY_CONTROL_GUIDE_TEXT, {
      fontSize: LOBBY_CONTROL_GUIDE_FONT_SIZE,
      color: LOBBY_CONTROL_GUIDE_COLOR,
    });
    this.add.text(LOBBY_GOAL_GUIDE_X, LOBBY_GOAL_GUIDE_Y, createLobbyGoalText(FINAL_BOSS_PHASE), {
      fontSize: LOBBY_GOAL_GUIDE_FONT_SIZE,
      color: LOBBY_GOAL_GUIDE_COLOR,
    });

    this.input.keyboard?.once("keydown-ENTER", () => {
      this.scene.start("CharacterSelectScene");
    });
  }
}
