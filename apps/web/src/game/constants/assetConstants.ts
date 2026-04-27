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
