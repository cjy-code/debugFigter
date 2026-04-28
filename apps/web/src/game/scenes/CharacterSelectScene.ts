import Phaser from "phaser";
import {
  DEFAULT_PLAYER_CLASS_TYPE,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_CLASS_ORDER,
  PLAYER_IDLE_ANIMATION_KEY_BY_CLASS,
  PLAYER_IDLE_TEXTURE_KEY_BY_CLASS,
  WARRIOR_SELECT_ANIMATION_KEY,
  WARRIOR_SELECT_TEXTURE_KEYS,
  getPlayerClassProfile,
  type PlayerClassProfile,
} from "../constants/gameConstants";
import {
  LOBBY_CLASS_SELECT_GUIDE_TEXT,
  LOBBY_CLASS_SELECT_TITLE_TEXT,
} from "../constants/textConstants";
import {
  CHARACTER_SELECT_BACKGROUND_COLOR,
  CHARACTER_SELECT_BADGE_COLOR,
  CHARACTER_SELECT_BADGE_FONT_SIZE,
  CHARACTER_SELECT_BADGE_HEIGHT,
  CHARACTER_SELECT_BADGE_STROKE_COLOR,
  CHARACTER_SELECT_BADGE_TEXT_COLOR,
  CHARACTER_SELECT_BADGE_WIDTH,
  CHARACTER_SELECT_BADGE_X,
  CHARACTER_SELECT_BADGE_Y,
  CHARACTER_SELECT_CARD_DESC_COLOR,
  CHARACTER_SELECT_CARD_DESC_FONT_SIZE,
  CHARACTER_SELECT_CARD_DESC_Y_OFFSET,
  CHARACTER_SELECT_CARD_GAP_X,
  CHARACTER_SELECT_CARD_HEIGHT,
  CHARACTER_SELECT_CARD_NAME_COLOR,
  CHARACTER_SELECT_CARD_NAME_FONT_SIZE,
  CHARACTER_SELECT_CARD_NAME_Y_OFFSET,
  CHARACTER_SELECT_CARD_NORMAL_COLOR,
  CHARACTER_SELECT_CARD_NORMAL_STROKE_COLOR,
  CHARACTER_SELECT_CARD_SELECTED_COLOR,
  CHARACTER_SELECT_CARD_SELECTED_SCALE,
  CHARACTER_SELECT_CARD_SELECTED_STROKE_COLOR,
  CHARACTER_SELECT_CARD_START_X,
  CHARACTER_SELECT_CARD_STROKE_WIDTH,
  CHARACTER_SELECT_CARD_WIDTH,
  CHARACTER_SELECT_CARD_Y,
  CHARACTER_SELECT_DETAIL_DESC_COLOR,
  CHARACTER_SELECT_DETAIL_DESC_FONT_SIZE,
  CHARACTER_SELECT_DETAIL_DESC_Y,
  CHARACTER_SELECT_DETAIL_PANEL_HEIGHT,
  CHARACTER_SELECT_DETAIL_PANEL_WIDTH,
  CHARACTER_SELECT_DETAIL_PANEL_X,
  CHARACTER_SELECT_DETAIL_PANEL_Y,
  CHARACTER_SELECT_DETAIL_PORTRAIT_SCALE,
  CHARACTER_SELECT_DETAIL_PORTRAIT_X,
  CHARACTER_SELECT_DETAIL_PORTRAIT_Y,
  CHARACTER_SELECT_DETAIL_STAT_COLOR,
  CHARACTER_SELECT_DETAIL_STAT_FONT_SIZE,
  CHARACTER_SELECT_DETAIL_STAT_Y,
  CHARACTER_SELECT_DETAIL_TEXT_X,
  CHARACTER_SELECT_DETAIL_TITLE_COLOR,
  CHARACTER_SELECT_DETAIL_TITLE_FONT_SIZE,
  CHARACTER_SELECT_DETAIL_TITLE_Y,
  CHARACTER_SELECT_GUIDE_COLOR,
  CHARACTER_SELECT_GUIDE_FONT_SIZE,
  CHARACTER_SELECT_GUIDE_ORIGIN_X,
  CHARACTER_SELECT_GUIDE_ORIGIN_Y,
  CHARACTER_SELECT_GUIDE_X,
  CHARACTER_SELECT_GUIDE_Y,
  CHARACTER_SELECT_PANEL_ALPHA,
  CHARACTER_SELECT_PANEL_COLOR,
  CHARACTER_SELECT_PANEL_STROKE_COLOR,
  CHARACTER_SELECT_SPRITE_SCALE,
  CHARACTER_SELECT_SPRITE_Y_OFFSET,
  CHARACTER_SELECT_STAT_COLOR,
  CHARACTER_SELECT_STAT_FONT_SIZE,
  CHARACTER_SELECT_STAT_Y_OFFSET,
  CHARACTER_SELECT_TITLE_COLOR,
  CHARACTER_SELECT_TITLE_FONT_SIZE,
  CHARACTER_SELECT_TITLE_ORIGIN_X,
  CHARACTER_SELECT_TITLE_ORIGIN_Y,
  CHARACTER_SELECT_TITLE_X,
  CHARACTER_SELECT_TITLE_Y,
} from "../constants/uiLayoutConstants";
import { eventBus } from "../core/eventBus";
import type { PlayerClassType } from "../shared/gameTypes";

/**
 * @date 2026-04-27
 * @desc 전사/마법사/궁수 중 시작 직업을 선택한다.
 */
export class CharacterSelectScene extends Phaser.Scene {
  private selectedClassIndex = PLAYER_CLASS_ORDER.indexOf(DEFAULT_PLAYER_CLASS_TYPE);
  private classCardContainers: Phaser.GameObjects.Container[] = [];
  private detailObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("CharacterSelectScene");
  }

  /**
   * @date 2026-04-27
   * @desc 캐릭터 선택 UI를 구성하고 입력 처리 루프를 등록한다.
   */
  create() {
    eventBus.emit("scene:changed", "Character Select");
    this.cameras.main.setBackgroundColor(`#${CHARACTER_SELECT_BACKGROUND_COLOR.toString(16)}`);
    this.selectedClassIndex = PLAYER_CLASS_ORDER.indexOf(DEFAULT_PLAYER_CLASS_TYPE);
    this.classCardContainers = [];
    this.detailObjects = [];

    this.createSceneBackground();
    this.createTitleAndGuide();
    this.renderClassOptions();
    this.bindClassSelectionInput();
  }

  /**
   * @date 2026-04-28
   * @desc 선택창 배경 패널과 화면 하단 상세 영역 패널을 생성한다.
   */
  private createSceneBackground() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, CHARACTER_SELECT_BACKGROUND_COLOR).setOrigin(0);

    const topPanel = this.add.rectangle(
      GAME_WIDTH / 2,
      196,
      GAME_WIDTH - 96,
      250,
      CHARACTER_SELECT_PANEL_COLOR,
      CHARACTER_SELECT_PANEL_ALPHA,
    );
    topPanel.setStrokeStyle(2, CHARACTER_SELECT_PANEL_STROKE_COLOR);

    const detailPanel = this.add.rectangle(
      CHARACTER_SELECT_DETAIL_PANEL_X,
      CHARACTER_SELECT_DETAIL_PANEL_Y,
      CHARACTER_SELECT_DETAIL_PANEL_WIDTH,
      CHARACTER_SELECT_DETAIL_PANEL_HEIGHT,
      CHARACTER_SELECT_PANEL_COLOR,
      CHARACTER_SELECT_PANEL_ALPHA,
    );
    detailPanel.setOrigin(0, 0);
    detailPanel.setStrokeStyle(2, CHARACTER_SELECT_PANEL_STROKE_COLOR);
  }

  /**
   * @date 2026-04-28
   * @desc 선택창 타이틀과 조작 안내 문구를 생성한다.
   */
  private createTitleAndGuide() {
    this.add
      .text(CHARACTER_SELECT_TITLE_X, CHARACTER_SELECT_TITLE_Y, LOBBY_CLASS_SELECT_TITLE_TEXT, {
        fontSize: CHARACTER_SELECT_TITLE_FONT_SIZE,
        color: CHARACTER_SELECT_TITLE_COLOR,
      })
      .setOrigin(CHARACTER_SELECT_TITLE_ORIGIN_X, CHARACTER_SELECT_TITLE_ORIGIN_Y);

    this.add
      .text(CHARACTER_SELECT_GUIDE_X, CHARACTER_SELECT_GUIDE_Y, LOBBY_CLASS_SELECT_GUIDE_TEXT, {
        fontSize: CHARACTER_SELECT_GUIDE_FONT_SIZE,
        color: CHARACTER_SELECT_GUIDE_COLOR,
      })
      .setOrigin(CHARACTER_SELECT_GUIDE_ORIGIN_X, CHARACTER_SELECT_GUIDE_ORIGIN_Y);
  }

  /**
   * @date 2026-04-27
   * @desc 현재 선택 상태를 반영해 직업 카드와 상세 프리뷰를 다시 렌더링한다.
   */
  private renderClassOptions() {
    this.classCardContainers.forEach((container) => {
      container.destroy(true);
    });
    this.classCardContainers = PLAYER_CLASS_ORDER.map((classType, index) => {
      const profile = getPlayerClassProfile(classType);
      return this.createClassCard(profile, index, index === this.selectedClassIndex);
    });
    this.renderSelectedClassDetail();
  }

  /**
   * @date 2026-04-28
   * @desc 직업별 선택 카드와 카드 내부 캐릭터 스프라이트를 생성한다.
   */
  private createClassCard(
    classProfile: PlayerClassProfile,
    index: number,
    isSelected: boolean,
  ) {
    const cardX = CHARACTER_SELECT_CARD_START_X + index * CHARACTER_SELECT_CARD_GAP_X;
    const container = this.add.container(cardX, CHARACTER_SELECT_CARD_Y);
    const cardBackground = this.add.rectangle(
      0,
      0,
      CHARACTER_SELECT_CARD_WIDTH,
      CHARACTER_SELECT_CARD_HEIGHT,
      isSelected ? CHARACTER_SELECT_CARD_SELECTED_COLOR : CHARACTER_SELECT_CARD_NORMAL_COLOR,
      1,
    );
    cardBackground.setStrokeStyle(
      CHARACTER_SELECT_CARD_STROKE_WIDTH,
      isSelected
        ? CHARACTER_SELECT_CARD_SELECTED_STROKE_COLOR
        : CHARACTER_SELECT_CARD_NORMAL_STROKE_COLOR,
    );

    const characterSprite = this.createClassSprite(
      classProfile.classType,
      0,
      CHARACTER_SELECT_SPRITE_Y_OFFSET,
    );
    characterSprite.setScale(CHARACTER_SELECT_SPRITE_SCALE);
    const nameText = this.add
      .text(0, CHARACTER_SELECT_CARD_NAME_Y_OFFSET, classProfile.name, {
        fontSize: CHARACTER_SELECT_CARD_NAME_FONT_SIZE,
        color: CHARACTER_SELECT_CARD_NAME_COLOR,
      })
      .setOrigin(0.5);
    const descriptionText = this.add
      .text(0, CHARACTER_SELECT_CARD_DESC_Y_OFFSET, classProfile.description, {
        fontSize: CHARACTER_SELECT_CARD_DESC_FONT_SIZE,
        color: CHARACTER_SELECT_CARD_DESC_COLOR,
      })
      .setOrigin(0.5);
    const statText = this.add
      .text(0, CHARACTER_SELECT_STAT_Y_OFFSET, this.createClassStatText(classProfile), {
        fontSize: CHARACTER_SELECT_STAT_FONT_SIZE,
        color: CHARACTER_SELECT_STAT_COLOR,
      })
      .setOrigin(0.5);

    container.add([cardBackground, characterSprite, nameText, descriptionText, statText]);
    container.setScale(isSelected ? CHARACTER_SELECT_CARD_SELECTED_SCALE : 1);
    return container;
  }

  /**
   * @date 2026-04-28
   * @desc 직업 타입에 맞는 선택창용 캐릭터 스프라이트를 생성한다.
   */
  private createClassSprite(classType: PlayerClassType, x: number, y: number) {
    const textureKey =
      classType === "warrior"
        ? WARRIOR_SELECT_TEXTURE_KEYS.idleSheet
        : PLAYER_IDLE_TEXTURE_KEY_BY_CLASS[classType];
    const animationKey =
      classType === "warrior"
        ? WARRIOR_SELECT_ANIMATION_KEY
        : PLAYER_IDLE_ANIMATION_KEY_BY_CLASS[classType];
    const sprite = this.add.sprite(x, y, textureKey);
    sprite.play(animationKey, true);
    return sprite;
  }

  /**
   * @date 2026-04-28
   * @desc 선택한 직업 상세 정보와 대표 이미지를 하단 패널에 표시한다.
   */
  private renderSelectedClassDetail() {
    this.detailObjects.forEach((detailObject) => {
      detailObject.destroy();
    });
    this.detailObjects = [];

    const selectedClassType = PLAYER_CLASS_ORDER[this.selectedClassIndex];
    const profile = getPlayerClassProfile(selectedClassType);
    const badge = this.add.rectangle(
      CHARACTER_SELECT_BADGE_X,
      CHARACTER_SELECT_BADGE_Y,
      CHARACTER_SELECT_BADGE_WIDTH,
      CHARACTER_SELECT_BADGE_HEIGHT,
      CHARACTER_SELECT_BADGE_COLOR,
    );
    badge.setOrigin(0, 0);
    badge.setStrokeStyle(2, CHARACTER_SELECT_BADGE_STROKE_COLOR);

    const badgeText = this.add
      .text(
        CHARACTER_SELECT_BADGE_X + CHARACTER_SELECT_BADGE_WIDTH / 2,
        CHARACTER_SELECT_BADGE_Y + CHARACTER_SELECT_BADGE_HEIGHT / 2,
        `${profile.name} 선택됨`,
        {
          fontSize: CHARACTER_SELECT_BADGE_FONT_SIZE,
          color: CHARACTER_SELECT_BADGE_TEXT_COLOR,
        },
      )
      .setOrigin(0.5);
    const portrait = this.createDetailPortrait(selectedClassType);
    const title = this.add.text(
      CHARACTER_SELECT_DETAIL_TEXT_X,
      CHARACTER_SELECT_DETAIL_TITLE_Y,
      profile.name,
      {
        fontSize: CHARACTER_SELECT_DETAIL_TITLE_FONT_SIZE,
        color: CHARACTER_SELECT_DETAIL_TITLE_COLOR,
      },
    );
    const description = this.add.text(
      CHARACTER_SELECT_DETAIL_TEXT_X,
      CHARACTER_SELECT_DETAIL_DESC_Y,
      profile.description,
      {
        fontSize: CHARACTER_SELECT_DETAIL_DESC_FONT_SIZE,
        color: CHARACTER_SELECT_DETAIL_DESC_COLOR,
      },
    );
    const stat = this.add.text(
      CHARACTER_SELECT_DETAIL_TEXT_X,
      CHARACTER_SELECT_DETAIL_STAT_Y,
      this.createClassStatText(profile),
      {
        fontSize: CHARACTER_SELECT_DETAIL_STAT_FONT_SIZE,
        color: CHARACTER_SELECT_DETAIL_STAT_COLOR,
      },
    );

    this.detailObjects.push(badge, badgeText, portrait, title, description, stat);
  }

  /**
   * @date 2026-04-28
   * @desc 선택한 직업의 상세 대표 이미지를 생성한다.
   */
  private createDetailPortrait(classType: PlayerClassType) {
    if (classType === "warrior") {
      return this.add
        .image(
          CHARACTER_SELECT_DETAIL_PORTRAIT_X,
          CHARACTER_SELECT_DETAIL_PORTRAIT_Y,
          WARRIOR_SELECT_TEXTURE_KEYS.portrait,
        )
        .setScale(CHARACTER_SELECT_DETAIL_PORTRAIT_SCALE);
    }

    return this.createClassSprite(
      classType,
      CHARACTER_SELECT_DETAIL_PORTRAIT_X,
      CHARACTER_SELECT_DETAIL_PORTRAIT_Y,
    ).setScale(1.75);
  }

  /**
   * @date 2026-04-27
   * @desc 숫자/방향키 직업 선택과 Enter 확정 입력을 처리한다.
   */
  private bindClassSelectionInput() {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    const numberKeys = keyboard.addKeys({
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
    }) as {
      one: Phaser.Input.Keyboard.Key;
      two: Phaser.Input.Keyboard.Key;
      three: Phaser.Input.Keyboard.Key;
    };
    const cursorKeys = keyboard.createCursorKeys();
    const enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    const updateHandler = () => {
      if (Phaser.Input.Keyboard.JustDown(numberKeys.one)) {
        this.updateSelectedClassByIndex(0);
      } else if (Phaser.Input.Keyboard.JustDown(numberKeys.two)) {
        this.updateSelectedClassByIndex(1);
      } else if (Phaser.Input.Keyboard.JustDown(numberKeys.three)) {
        this.updateSelectedClassByIndex(2);
      } else if (Phaser.Input.Keyboard.JustDown(cursorKeys.left)) {
        this.updateSelectedClassByIndex(this.selectedClassIndex - 1);
      } else if (Phaser.Input.Keyboard.JustDown(cursorKeys.right)) {
        this.updateSelectedClassByIndex(this.selectedClassIndex + 1);
      }

      if (Phaser.Input.Keyboard.JustDown(enterKey)) {
        this.startRunWithSelectedClass();
      }
    };

    this.events.on(Phaser.Scenes.Events.UPDATE, updateHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.UPDATE, updateHandler);
    });
  }

  /**
   * @date 2026-04-27
   * @desc 범위를 순환 보정하여 선택 직업 인덱스를 갱신한다.
   */
  private updateSelectedClassByIndex(nextIndex: number) {
    const classCount = PLAYER_CLASS_ORDER.length;
    const normalizedIndex = ((nextIndex % classCount) + classCount) % classCount;
    if (normalizedIndex === this.selectedClassIndex) {
      return;
    }

    this.selectedClassIndex = normalizedIndex;
    this.renderClassOptions();
  }

  /**
   * @date 2026-04-27
   * @desc 선택한 직업 정보를 포함해 스테이지 씬을 시작한다.
   */
  private startRunWithSelectedClass() {
    const selectedClassType = PLAYER_CLASS_ORDER[this.selectedClassIndex];
    this.scene.start("StageScene", {
      playerClassType: selectedClassType,
    });
  }

  /**
   * @date 2026-04-28
   * @desc 직업 전투 스탯을 선택창 표시용 문자열로 변환한다.
   */
  private createClassStatText(classProfile: PlayerClassProfile) {
    return `HP ${classProfile.maxHp} / ATK ${classProfile.damage} / RNG ${classProfile.attackRange}`;
  }
}
