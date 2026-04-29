import Phaser from "phaser";
import {
  BASIC_ATTACK_SOUND_KEYS,
  BOSS_TEXTURE_KEYS,
  CHARACTER_SPRITE_SHEET_CONFIG,
  KARMA_TEXTURE_KEYS,
  MONSTER_TEXTURE_KEYS,
  PLAYER_CLASS_ORDER,
  PLAYER_IDLE_ANIMATION_KEY_BY_CLASS,
  PLAYER_IDLE_TEXTURE_KEY_BY_CLASS,
  STAGE_BACKGROUND_TEXTURE_KEYS,
  STAGE_BGM_SOUND_KEYS,
  SHARED_FX_SHEET_CONFIG,
  SHARED_FX_TEXTURE_KEYS,
  WARRIOR_SELECT_ANIMATION_KEY,
  WARRIOR_SELECT_TEXTURE_KEYS,
  WARRIOR_STAGE_ANIMATION_KEY,
  WARRIOR_STAGE_TEXTURE_KEY,
} from "../constants/gameConstants";
import { eventBus } from "../core/eventBus";

/**
 * @date 2026-04-27
 * @desc 게임 시작 시 캐릭터/이펙트 에셋을 로드하고 로비 씬으로 전환한다.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  /**
   * @date 2026-04-27
   * @desc 직업별 캐릭터 idle 시트와 공통 FX 시트를 메모리에 로드한다.
   */
  preload() {
    this.load.spritesheet(
      PLAYER_IDLE_TEXTURE_KEY_BY_CLASS.warrior,
      "/assets/characters/warrior/warrior_idle_v01.v04.png",
      {
        frameWidth: CHARACTER_SPRITE_SHEET_CONFIG.frameWidth,
        frameHeight: CHARACTER_SPRITE_SHEET_CONFIG.frameHeight,
      },
    );
    this.load.spritesheet(
      WARRIOR_SELECT_TEXTURE_KEYS.idleSheet,
      "/assets/characters/warrior/processed/warrior_idle_card_sheet.png",
      {
        frameWidth: CHARACTER_SPRITE_SHEET_CONFIG.frameWidth,
        frameHeight: CHARACTER_SPRITE_SHEET_CONFIG.frameHeight,
      },
    );
    this.load.spritesheet(
      WARRIOR_STAGE_TEXTURE_KEY,
      "/assets/characters/warrior/processed/warrior_idle_card_sheet.png",
      {
        frameWidth: CHARACTER_SPRITE_SHEET_CONFIG.frameWidth,
        frameHeight: CHARACTER_SPRITE_SHEET_CONFIG.frameHeight,
      },
    );
    this.load.image(
      WARRIOR_SELECT_TEXTURE_KEYS.portrait,
      "/assets/characters/warrior/processed/warrior_select_portrait.png",
    );
    this.load.spritesheet(
      PLAYER_IDLE_TEXTURE_KEY_BY_CLASS.mage,
      "/assets/characters/mage/mage_idle_v01.v04.png",
      {
        frameWidth: CHARACTER_SPRITE_SHEET_CONFIG.frameWidth,
        frameHeight: CHARACTER_SPRITE_SHEET_CONFIG.frameHeight,
      },
    );
    this.load.spritesheet(
      PLAYER_IDLE_TEXTURE_KEY_BY_CLASS.archer,
      "/assets/characters/archer/archer_idle_v01.v04.png",
      {
        frameWidth: CHARACTER_SPRITE_SHEET_CONFIG.frameWidth,
        frameHeight: CHARACTER_SPRITE_SHEET_CONFIG.frameHeight,
      },
    );
    this.load.spritesheet(
      SHARED_FX_TEXTURE_KEYS.hit,
      "/assets/characters/shared/fx_hit_v01.v04.png",
      {
        frameWidth: SHARED_FX_SHEET_CONFIG.frameWidth,
        frameHeight: SHARED_FX_SHEET_CONFIG.frameHeight,
      },
    );
    this.load.spritesheet(
      SHARED_FX_TEXTURE_KEYS.glitchSlash,
      "/assets/characters/shared/fx_glitch_slash_v01.v04.png",
      {
        frameWidth: SHARED_FX_SHEET_CONFIG.frameWidth,
        frameHeight: SHARED_FX_SHEET_CONFIG.frameHeight,
      },
    );
    this.load.audio(BASIC_ATTACK_SOUND_KEYS.hit, "/assets/audio/hit.wav");
    this.load.audio(
      STAGE_BGM_SOUND_KEYS.mainBattle,
      "/assets/audio/cyber-glitch-battle-v2.wav",
    );
    this.load.image(
      MONSTER_TEXTURE_KEYS.nullSlime,
      "/assets/monsters/null-slime/null_slime_idle_game_v01.png",
    );
    this.load.image(
      MONSTER_TEXTURE_KEYS.memoryLeakSlime,
      "/assets/monsters/memory-leak-slime/memory_leak_slime_idle_game_v01.png",
    );
    this.load.image(
      BOSS_TEXTURE_KEYS.syntaxTyrant,
      "/assets/bosses/syntax-tyrant/syntax_tyrant_idle_game_v01.png",
    );
    this.load.image(
      KARMA_TEXTURE_KEYS.orb,
      "/assets/karma/karma_orb_game_v01.png",
    );
    this.load.image(
      STAGE_BACKGROUND_TEXTURE_KEYS.coreDebugTile,
      "/assets/backgrounds/core-debug/core_debug_tile_v01.png",
    );
  }

  /**
   * @date 2026-04-27
   * @desc 캐릭터 idle 애니메이션 등록 후 로비 씬으로 전환한다.
   */
  create() {
    this.registerCharacterAnimations();
    this.registerWarriorSelectAnimation();
    this.registerWarriorStageAnimation();
    eventBus.emit("scene:changed", "Boot");
    this.scene.start("LobbyScene");
  }

  /**
   * @date 2026-04-27
   * @desc 직업별 idle 애니메이션을 전역 애니메이션 매니저에 등록한다.
   */
  private registerCharacterAnimations() {
    PLAYER_CLASS_ORDER.forEach((classType) => {
      const animationKey = PLAYER_IDLE_ANIMATION_KEY_BY_CLASS[classType];
      const textureKey = PLAYER_IDLE_TEXTURE_KEY_BY_CLASS[classType];
      if (this.anims.exists(animationKey)) {
        return;
      }

      this.anims.create({
        key: animationKey,
        frames: this.anims.generateFrameNumbers(textureKey, {
          start: 0,
          end: CHARACTER_SPRITE_SHEET_CONFIG.frameCount - 1,
        }),
        frameRate: CHARACTER_SPRITE_SHEET_CONFIG.fps,
        repeat: -1,
      });
    });
  }

  /**
   * @date 2026-04-28
   * @desc 캐릭터 선택창 전사 카드용 idle 애니메이션을 등록한다.
   */
  private registerWarriorSelectAnimation() {
    if (this.anims.exists(WARRIOR_SELECT_ANIMATION_KEY)) {
      return;
    }

    this.anims.create({
      key: WARRIOR_SELECT_ANIMATION_KEY,
      frames: this.anims.generateFrameNumbers(WARRIOR_SELECT_TEXTURE_KEYS.idleSheet, {
        start: 0,
        end: CHARACTER_SPRITE_SHEET_CONFIG.frameCount - 1,
      }),
      frameRate: CHARACTER_SPRITE_SHEET_CONFIG.fps,
      repeat: -1,
    });
  }

  /**
   * @date 2026-04-28
   * @desc 플레이 화면 전사 캐릭터용 idle 애니메이션을 등록한다.
   */
  private registerWarriorStageAnimation() {
    if (this.anims.exists(WARRIOR_STAGE_ANIMATION_KEY)) {
      return;
    }

    this.anims.create({
      key: WARRIOR_STAGE_ANIMATION_KEY,
      frames: this.anims.generateFrameNumbers(WARRIOR_STAGE_TEXTURE_KEY, {
        start: 0,
        end: CHARACTER_SPRITE_SHEET_CONFIG.frameCount - 1,
      }),
      frameRate: CHARACTER_SPRITE_SHEET_CONFIG.fps,
      repeat: -1,
    });
  }
}
