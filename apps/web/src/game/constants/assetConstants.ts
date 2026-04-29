import type { PlayerClassType } from "../shared/gameTypes";

export const PLAYER_IDLE_TEXTURE_KEY_BY_CLASS: Record<PlayerClassType, string> = {
  warrior: "player-idle-warrior",
  mage: "player-idle-mage",
  archer: "player-idle-archer",
};

export const PLAYER_IDLE_ANIMATION_KEY_BY_CLASS: Record<PlayerClassType, string> = {
  warrior: "anim-player-idle-warrior",
  mage: "anim-player-idle-mage",
  archer: "anim-player-idle-archer",
};

export const WARRIOR_SELECT_TEXTURE_KEYS = {
  idleSheet: "warrior-select-idle-sheet",
  portrait: "warrior-select-portrait",
};

export const WARRIOR_SELECT_ANIMATION_KEY = "anim-warrior-select-idle";
export const WARRIOR_STAGE_TEXTURE_KEY = "warrior-stage-idle-sheet";
export const WARRIOR_STAGE_ANIMATION_KEY = "anim-warrior-stage-idle";

export const CHARACTER_SPRITE_SHEET_CONFIG = {
  frameWidth: 96,
  frameHeight: 96,
  frameCount: 8,
  fps: 8,
};

export const SHARED_FX_TEXTURE_KEYS = {
  hit: "fx-hit",
  glitchSlash: "fx-glitch-slash",
};

export const BASIC_ATTACK_SOUND_KEYS = {
  hit: "sound-basic-attack-hit",
};

export const STAGE_BGM_SOUND_KEYS = {
  mainBattle: "bgm-stage-main-battle",
};

export const MONSTER_TEXTURE_KEYS = {
  memoryLeakSlime: "monster-memory-leak-slime",
  nullSlime: "monster-null-slime",
};

export const BOSS_TEXTURE_KEYS = {
  syntaxTyrant: "boss-syntax-tyrant",
};

export const KARMA_TEXTURE_KEYS = {
  orb: "karma-orb",
};

export const STAGE_BACKGROUND_TEXTURE_KEYS = {
  coreDebugTile: "stage-core-debug-tile",
};

export const SHARED_FX_SHEET_CONFIG = {
  frameWidth: 96,
  frameHeight: 96,
  frameCount: 5,
  fps: 10,
};

export const STAGE_PARALLAX_TEXTURE_KEYS = {
  far: "stage-parallax-far",
  mid: "stage-parallax-mid",
  front: "stage-parallax-front",
};

export const STAGE_PARALLAX_SCROLL_FACTORS = {
  far: { x: 0.14, y: 0.04 },
  mid: { x: 0.28, y: 0.1 },
  front: { x: 0.42, y: 0.16 },
};
