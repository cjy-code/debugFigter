import Phaser from "phaser";
import {
  CHARACTER_SPRITE_SHEET_CONFIG,
  PLAYER_CLASS_ORDER,
  PLAYER_IDLE_ANIMATION_KEY_BY_CLASS,
  PLAYER_IDLE_TEXTURE_KEY_BY_CLASS,
  STAGE_PARALLAX_TEXTURE_KEYS,
  SHARED_FX_SHEET_CONFIG,
  SHARED_FX_TEXTURE_KEYS,
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
    this.load.image(
      STAGE_PARALLAX_TEXTURE_KEYS.far,
      "/assets/backgrounds/core-city/core_city_far_v01.png",
    );
    this.load.image(
      STAGE_PARALLAX_TEXTURE_KEYS.mid,
      "/assets/backgrounds/core-city/core_city_mid_v01.png",
    );
    this.load.image(
      STAGE_PARALLAX_TEXTURE_KEYS.front,
      "/assets/backgrounds/core-city/core_city_front_v01.png",
    );
  }

  /**
   * @date 2026-04-27
   * @desc 캐릭터 idle 애니메이션 등록 후 로비 씬으로 전환한다.
   */
  create() {
    this.registerCharacterAnimations();
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
}
