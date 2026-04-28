import type { PlayerClassType, PlayerState } from "../shared/gameTypes";
import { PLAYER_SPEED } from "./combatConstants";
import {
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
    color: 0x3b82f6,
  },
  mage: {
    classType: "mage",
    name: "마법사",
    description: "중거리 광역 제어",
    maxHp: 95,
    damage: 16,
    attackRange: 150,
    color: 0xa855f7,
  },
  archer: {
    classType: "archer",
    name: "궁수",
    description: "원거리 견제 특화",
    maxHp: 105,
    damage: 12,
    attackRange: 220,
    color: 0x22c55e,
  },
};

/**
 * @date 2026-04-27
 * @desc 선택한 직업 타입에 해당하는 프로필 정보를 반환한다.
 */
export function getPlayerClassProfile(classType: PlayerClassType) {
  return PLAYER_CLASS_PROFILES[classType];
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
    attackCount: PLAYER_BASE_ATTACK_COUNT,
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
      water: 0,
      wind: 0,
      rock: 0,
      dark: 0,
      holy: 0,
      transformShard: 0,
    },
    skills: [{ id: "nullPointer", level: 1 }],
    passives: [],
  };
}
