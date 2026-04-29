import type {
  BasicAttackType,
  KarmaAutoSkillState,
  KarmaElementId,
  KarmaElementState,
  PlayerClassType,
  PlayerState,
} from "../shared/gameTypes";
import { PLAYER_SPEED } from "./combatConstants";
import {
  KARMA_ELECTRIC_BASE_COOLDOWN_MS,
  KARMA_ELECTRIC_BASE_RANGE,
  KARMA_ELECTRIC_CHAIN_RADIUS,
  KARMA_FIRE_BASE_COOLDOWN_MS,
  KARMA_FIRE_BASE_HITBOX_RADIUS,
  KARMA_FIRE_BASE_RANGE,
  KARMA_MAX_SELECTED_ELEMENT_COUNT,
  KARMA_ROCK_BASE_RANGE,
  KARMA_ROCK_BASE_RESPAWN_MS,
  KARMA_ROCK_HITBOX_RADIUS,
  PLAYER_BASE_AREA_MULTIPLIER,
  PLAYER_BASE_ATTACK_COUNT,
  PLAYER_BASE_COOLDOWN_MULTIPLIER,
  PLAYER_BASE_CRITICAL_CHANCE,
  PLAYER_BASE_CRITICAL_DAMAGE_MULTIPLIER,
  PLAYER_BASE_EXP_MULTIPLIER,
  PLAYER_BASE_PICKUP_RADIUS,
} from "./progressionConstants";

export type PlayerClassProfile = {
  classType: PlayerClassType;
  name: string;
  description: string;
  maxHp: number;
  damage: number;
  attackRange: number;
  basicAttackType: BasicAttackType;
  baseAttackCount: number;
  color: number;
};

export const DEFAULT_PLAYER_CLASS_TYPE: PlayerClassType = "warrior";

export const PLAYER_CLASS_ORDER: PlayerClassType[] = ["warrior", "mage", "archer"];

export const PLAYER_CLASS_PROFILES: Record<PlayerClassType, PlayerClassProfile> = {
  warrior: {
    classType: "warrior",
    name: "전사",
    description: "근접 전투 특화",
    maxHp: 125,
    damage: 14,
    attackRange: 88,
    basicAttackType: "multiHit",
    baseAttackCount: 3,
    color: 0x3b82f6,
  },
  mage: {
    classType: "mage",
    name: "마법사",
    description: "중거리 광역 제어",
    maxHp: 95,
    damage: 16,
    attackRange: 150,
    basicAttackType: "singleHit",
    baseAttackCount: 1,
    color: 0xa855f7,
  },
  archer: {
    classType: "archer",
    name: "궁수",
    description: "원거리 견제 특화",
    maxHp: 105,
    damage: 12,
    attackRange: 220,
    basicAttackType: "singleHit",
    baseAttackCount: 1,
    color: 0x22c55e,
  },
};

const KARMA_ELEMENT_IDS: KarmaElementId[] = ["fire", "electric", "rock"];

/**
 * @date 2026-04-27
 * @desc 선택한 직업 타입에 해당하는 프로필 정보를 반환한다.
 */
export function getPlayerClassProfile(classType: PlayerClassType) {
  return PLAYER_CLASS_PROFILES[classType];
}

/**
 * @date 2026-04-29
 * @desc 카르마 속성별 초기 성장 상태를 생성한다.
 */
function createInitialKarmaElements() {
  return KARMA_ELEMENT_IDS.reduce(
    (karmaElements, karmaElementId) => {
      const autoSkill = createInitialKarmaAutoSkill(karmaElementId);
      karmaElements[karmaElementId] = {
        id: karmaElementId,
        level: 1,
        exp: 0,
        requiredExp: 3,
        damageMultiplier: autoSkill.damageMultiplier,
        count: autoSkill.hitCount,
        range: autoSkill.range,
        hitboxRadius: autoSkill.hitboxRadius,
      };
      return karmaElements;
    },
    {} as Record<KarmaElementId, KarmaElementState>,
  );
}

/**
 * @date 2026-04-29
 * @desc 카르마 자동 공격 스킬의 초기 런타임 상태를 생성한다.
 */
function createInitialKarmaAutoSkill(karmaElementId: KarmaElementId): KarmaAutoSkillState {
  if (karmaElementId === "electric") {
    return {
      id: karmaElementId,
      level: 1,
      exp: 0,
      baseCooldownMs: KARMA_ELECTRIC_BASE_COOLDOWN_MS,
      currentCooldownMs: KARMA_ELECTRIC_BASE_COOLDOWN_MS,
      nextCastAt: 0,
      damageMultiplier: 0.8,
      hitCount: 2,
      range: KARMA_ELECTRIC_BASE_RANGE,
      hitboxRadius: KARMA_ELECTRIC_CHAIN_RADIUS,
    };
  }

  if (karmaElementId === "rock") {
    return {
      id: karmaElementId,
      level: 1,
      exp: 0,
      baseCooldownMs: KARMA_ROCK_BASE_RESPAWN_MS,
      currentCooldownMs: KARMA_ROCK_BASE_RESPAWN_MS,
      nextCastAt: 0,
      damageMultiplier: 0.9,
      hitCount: 1,
      range: KARMA_ROCK_BASE_RANGE,
      hitboxRadius: KARMA_ROCK_HITBOX_RADIUS,
    };
  }

  return {
    id: karmaElementId,
    level: 1,
    exp: 0,
    baseCooldownMs: KARMA_FIRE_BASE_COOLDOWN_MS,
    currentCooldownMs: KARMA_FIRE_BASE_COOLDOWN_MS,
    nextCastAt: 0,
    damageMultiplier: 1,
    hitCount: 1,
    range: KARMA_FIRE_BASE_RANGE,
    hitboxRadius: KARMA_FIRE_BASE_HITBOX_RADIUS,
  };
}

/**
 * @date 2026-04-29
 * @desc 카르마 자동 공격 스킬 초기 상태 목록을 생성한다.
 */
function createInitialKarmaAutoSkills() {
  return KARMA_ELEMENT_IDS.reduce(
    (karmaAutoSkills, karmaElementId) => {
      karmaAutoSkills[karmaElementId] = createInitialKarmaAutoSkill(karmaElementId);
      return karmaAutoSkills;
    },
    {} as Record<KarmaElementId, KarmaAutoSkillState>,
  );
}

/**
 * @date 2026-04-27
 * @desc 선택한 직업 타입을 기준으로 초기 플레이어 스탯을 생성한다.
 */
export function createInitialPlayerState(classType: PlayerClassType): PlayerState {
  const profile = getPlayerClassProfile(classType);
  return {
    classType: profile.classType,
    level: 1,
    exp: 0,
    hp: profile.maxHp,
    maxHp: profile.maxHp,
    baseDamage: profile.damage,
    damage: profile.damage,
    baseAttackRange: profile.attackRange,
    attackRange: profile.attackRange,
    moveSpeed: PLAYER_SPEED,
    pickupRadius: PLAYER_BASE_PICKUP_RADIUS,
    cooldownMultiplier: PLAYER_BASE_COOLDOWN_MULTIPLIER,
    areaMultiplier: PLAYER_BASE_AREA_MULTIPLIER,
    expMultiplier: PLAYER_BASE_EXP_MULTIPLIER,
    criticalChance: PLAYER_BASE_CRITICAL_CHANCE,
    criticalDamageMultiplier: PLAYER_BASE_CRITICAL_DAMAGE_MULTIPLIER,
    attackCount: Math.max(PLAYER_BASE_ATTACK_COUNT, profile.baseAttackCount),
    basicAttackType: profile.basicAttackType,
    statStacks: {
      attackSpeed: 0,
      expGain: 0,
      attackCount: 0,
      damage: 0,
      criticalChance: 0,
      criticalDamage: 0,
      moveSpeed: 0,
      attackRange: 0,
    },
    karmaCounts: {
      fire: 0,
      rock: 0,
      electric: 0,
    },
    karmaBuild: {
      id: "none",
      name: "기본 부기",
      tier: 0,
      successRate: 0,
      failStacks: 0,
      lastResult: "대기",
    },
    karmaElements: createInitialKarmaElements(),
    karmaSelection: {
      selectedElementIds: [],
      maxSelectedElementCount: KARMA_MAX_SELECTED_ELEMENT_COUNT,
      pendingOptions: [],
    },
    karmaAutoSkills: createInitialKarmaAutoSkills(),
    skills: [{ id: "nullPointer", level: 1 }],
    passives: [],
  };
}
