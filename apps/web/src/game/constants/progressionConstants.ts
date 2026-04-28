export const LEVEL_UP_INTERVAL_MS = 8_000;
export const PLAYER_BASE_PICKUP_RADIUS = 80;
export const PLAYER_BASE_COOLDOWN_MULTIPLIER = 1;
export const PLAYER_BASE_AREA_MULTIPLIER = 1;
export const PLAYER_BASE_EXP_MULTIPLIER = 1;
export const PLAYER_BASE_CRITICAL_CHANCE = 0.05;
export const PLAYER_BASE_CRITICAL_DAMAGE_MULTIPLIER = 1.5;
export const PLAYER_BASE_ATTACK_COUNT = 1;
export const STAT_SOFT_CAP_STACK = 30;
export const ATTACK_COUNT_STACKS_PER_BONUS = 12;
export const STAT_ATTACK_SPEED_PRIMARY_STEP = -0.012;
export const STAT_ATTACK_SPEED_SOFT_STEP = -0.004;
export const STAT_EXP_GAIN_PRIMARY_STEP = 0.025;
export const STAT_EXP_GAIN_SOFT_STEP = 0.008;
export const STAT_DAMAGE_PRIMARY_STEP = 0.04;
export const STAT_DAMAGE_SOFT_STEP = 0.015;
export const STAT_CRITICAL_CHANCE_PRIMARY_STEP = 0.015;
export const STAT_CRITICAL_CHANCE_SOFT_STEP = 0.004;
export const STAT_CRITICAL_DAMAGE_PRIMARY_STEP = 0.08;
export const STAT_CRITICAL_DAMAGE_SOFT_STEP = 0.02;
export const STAT_MOVE_SPEED_PRIMARY_STEP = 0.018;
export const STAT_MOVE_SPEED_SOFT_STEP = 0.007;
export const STAT_ATTACK_RANGE_PRIMARY_STEP = 0.035;
export const STAT_ATTACK_RANGE_SOFT_STEP = 0.012;
export const EXP_ORB_RADIUS = 6;
export const EXP_ORB_COLOR = 0x38bdf8;
export const EXP_ORB_STROKE_COLOR = 0xe0f2fe;
export const EXP_ORB_STROKE_WIDTH = 1;
export const EXP_ORB_DEPTH = 12;
export const EXP_ORB_SCATTER_RADIUS = 18;
export const EXP_ORB_ATTRACT_DELAY_MS = 5_000;
export const EXP_ORB_FORCE_ABSORB_DELAY_MS = 10_000;
export const EXP_ORB_MOVE_SPEED_FACTOR = 3.2;
export const EXP_ORB_MIN_MOVE_SPEED = 120;
export const EXP_ORB_MAX_MOVE_SPEED = 760;
export const EXP_ORB_ABSORB_DISTANCE = 10;
export const EXP_ORB_MAX_COUNT = 500;
export const KARMA_BASIC_DROP_RATE = 0.85;
export const KARMA_BASIC_MAX_COUNT = 30;
export const KARMA_TRANSFORM_SHARD_MAX_COUNT = 5;
export const KARMA_ORB_RADIUS = 5;
export const KARMA_ORB_DEPTH = 13;
export const KARMA_ORB_STROKE_COLOR = 0xffffff;
export const KARMA_ORB_STROKE_WIDTH = 1;
export const KARMA_ORB_SCATTER_RADIUS = 26;
export const KARMA_ORB_ABSORB_DISTANCE = 10;
export const KARMA_ORB_MOVE_SPEED_FACTOR = 3.4;
export const KARMA_ORB_MIN_MOVE_SPEED = 130;
export const KARMA_ORB_MAX_MOVE_SPEED = 820;
export const KARMA_COLOR_BY_ID = {
  fire: 0xef4444,
  water: 0x38bdf8,
  wind: 0x86efac,
  rock: 0xa16207,
  dark: 0x7c3aed,
  holy: 0xfde68a,
  transformShard: 0xf472b6,
} as const;
