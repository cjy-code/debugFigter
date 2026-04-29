import {
  KARMA_ELECTRIC_BASE_COOLDOWN_MS,
  KARMA_ELECTRIC_BASE_RANGE,
  KARMA_ELECTRIC_CHAIN_RADIUS,
  KARMA_ENHANCED_DROP_RATE,
  KARMA_EXP_PER_BOSS_DROP,
  KARMA_EXP_PER_ELITE_DROP,
  KARMA_EXP_PER_ENHANCED_DROP,
  KARMA_EXP_PER_NORMAL_DROP,
  KARMA_FIRE_BASE_COOLDOWN_MS,
  KARMA_FIRE_BASE_HITBOX_RADIUS,
  KARMA_FIRE_BASE_RANGE,
  KARMA_MAX_SELECTED_ELEMENT_COUNT,
  KARMA_NORMAL_DROP_RATE,
  KARMA_OPTION_COUNT,
  KARMA_ROCK_BASE_RANGE,
  KARMA_ROCK_BASE_RESPAWN_MS,
  KARMA_ROCK_HITBOX_RADIUS,
} from "../constants/gameConstants";
import type {
  KarmaAutoSkillState,
  KarmaBuildState,
  KarmaCounts,
  KarmaElementId,
  KarmaElements,
  KarmaElementState,
  KarmaId,
  KarmaSelectionState,
  MonsterGrade,
  PlayerClassType,
} from "../shared/gameTypes";

type KarmaGrantResult = {
  element: KarmaElementState;
  autoSkill: KarmaAutoSkillState;
  leveledUp: boolean;
  levelUpCount: number;
};

type LegacyKarmaCraftResult = {
  build: KarmaBuildState;
  consumedCounts: Partial<Record<KarmaId, number>>;
};

const KARMA_ELEMENT_IDS: KarmaElementId[] = ["fire", "electric", "rock"];

/**
 * @date 2026-04-29
 * @desc 카르마 선택, 경험치, 레벨업, 자동 공격 수치 계산을 담당한다.
 */
export class KarmaSystem {
  /**
   * @date 2026-04-29
   * @desc 현재 선택 상태에서 후보로 등장 가능한 카르마 속성 목록을 반환한다.
   */
  pickKarmaOptions(
    selectionState: KarmaSelectionState,
    randomProvider = Math.random,
  ): KarmaElementId[] {
    const selectedElementIds = selectionState.selectedElementIds;
    const selectedSet = new Set(selectedElementIds);
    const openElementIds =
      selectedElementIds.length >= selectionState.maxSelectedElementCount
        ? selectedElementIds
        : KARMA_ELEMENT_IDS.filter((karmaElementId) => !selectedSet.has(karmaElementId));
    const optionIds = [...selectedElementIds];
    const shuffledOpenElementIds = this.shuffleKarmaElementIds(openElementIds, randomProvider);

    shuffledOpenElementIds.forEach((karmaElementId) => {
      if (optionIds.length < KARMA_OPTION_COUNT && !optionIds.includes(karmaElementId)) {
        optionIds.push(karmaElementId);
      }
    });

    return optionIds.slice(0, KARMA_OPTION_COUNT);
  }

  /**
   * @date 2026-04-29
   * @desc 카르마 선택 상태에 선택한 속성을 반영한다.
   */
  applyKarmaSelection(
    selectionState: KarmaSelectionState,
    selectedElementId: KarmaElementId,
  ): KarmaSelectionState {
    if (selectionState.selectedElementIds.includes(selectedElementId)) {
      return {
        ...selectionState,
        pendingOptions: [],
      };
    }

    if (selectionState.selectedElementIds.length >= selectionState.maxSelectedElementCount) {
      return {
        ...selectionState,
        pendingOptions: [],
      };
    }

    return {
      ...selectionState,
      selectedElementIds: [...selectionState.selectedElementIds, selectedElementId],
      pendingOptions: [],
    };
  }

  /**
   * @date 2026-04-29
   * @desc 카르마 경험치를 추가하고 필요한 만큼 레벨업을 적용한다.
   */
  grantKarmaExp(
    karmaElements: KarmaElements,
    karmaAutoSkills: Record<KarmaElementId, KarmaAutoSkillState>,
    karmaElementId: KarmaElementId,
    expValue: number,
    playerClassType: PlayerClassType,
  ): KarmaGrantResult {
    const element = {
      ...karmaElements[karmaElementId],
      exp: karmaElements[karmaElementId].exp + expValue,
    };
    let levelUpCount = 0;

    while (element.exp >= element.requiredExp) {
      element.exp -= element.requiredExp;
      element.level += 1;
      element.requiredExp = this.getRequiredExp(element.level);
      levelUpCount += 1;
    }

    const nextAutoSkill = this.createAutoSkillState(
      karmaElementId,
      element.level,
      playerClassType,
      karmaAutoSkills[karmaElementId].nextCastAt,
    );
    element.damageMultiplier = nextAutoSkill.damageMultiplier;
    element.count = nextAutoSkill.hitCount;
    element.range = nextAutoSkill.range;
    element.hitboxRadius = nextAutoSkill.hitboxRadius;
    karmaElements[karmaElementId] = element;
    karmaAutoSkills[karmaElementId] = {
      ...nextAutoSkill,
      exp: element.exp,
    };

    return {
      element,
      autoSkill: karmaAutoSkills[karmaElementId],
      leveledUp: levelUpCount > 0,
      levelUpCount,
    };
  }

  /**
   * @date 2026-04-29
   * @desc 공격 속도 보정을 반영한 카르마 현재 쿨다운을 계산한다.
   */
  computeCurrentCooldown(baseCooldownMs: number, cooldownMultiplier: number) {
    return Math.max(120, Math.round(baseCooldownMs * cooldownMultiplier));
  }

  /**
   * @date 2026-04-29
   * @desc 몬스터 등급별 카르마 드랍 확률을 반환한다.
   */
  getDropRate(monsterGrade: MonsterGrade | "boss") {
    if (monsterGrade === "boss" || monsterGrade === "elite") {
      return 1;
    }

    if (monsterGrade === "enhanced") {
      return KARMA_ENHANCED_DROP_RATE;
    }

    return KARMA_NORMAL_DROP_RATE;
  }

  /**
   * @date 2026-04-29
   * @desc 몬스터 등급별 카르마 경험치 보상량을 반환한다.
   */
  getDropExpValue(monsterGrade: MonsterGrade | "boss") {
    if (monsterGrade === "boss") {
      return KARMA_EXP_PER_BOSS_DROP;
    }

    if (monsterGrade === "elite") {
      return KARMA_EXP_PER_ELITE_DROP;
    }

    if (monsterGrade === "enhanced") {
      return KARMA_EXP_PER_ENHANCED_DROP;
    }

    return KARMA_EXP_PER_NORMAL_DROP;
  }

  /**
   * @date 2026-04-29
   * @desc 카르마 획득 가능 여부를 반환한다.
   */
  canCollectKarma(_karmaCounts: KarmaCounts, _karmaId: KarmaId) {
    return true;
  }

  /**
   * @date 2026-04-29
   * @desc 카르마 드랍용 기본 속성을 반환한다.
   */
  pickWeightedBasicKarmaId(_karmaCounts: KarmaCounts, randomProvider = Math.random): KarmaElementId {
    const selectedIndex = Math.floor(randomProvider() * KARMA_ELEMENT_IDS.length);
    return KARMA_ELEMENT_IDS[selectedIndex] ?? "fire";
  }

  /**
   * @date 2026-04-29
   * @desc 1차 카르마에서는 조합 제작을 사용하지 않는다.
   */
  tryCraftBuild(): LegacyKarmaCraftResult | null {
    return null;
  }

  /**
   * @date 2026-04-29
   * @desc 선택된 카르마 슬롯 문자열을 반환한다.
   */
  createSlotText(selectionStateOrCounts: KarmaSelectionState | KarmaCounts) {
    if ("selectedElementIds" in selectionStateOrCounts) {
      return `${selectionStateOrCounts.selectedElementIds.length}/${selectionStateOrCounts.maxSelectedElementCount}`;
    }

    return `0/${KARMA_MAX_SELECTED_ELEMENT_COUNT}`;
  }

  /**
   * @date 2026-04-29
   * @desc 레벨 기준 자동 공격 스킬 상태를 생성한다.
   */
  private createAutoSkillState(
    karmaElementId: KarmaElementId,
    level: number,
    playerClassType: PlayerClassType,
    nextCastAt: number,
  ): KarmaAutoSkillState {
    const baseState = this.createBaseAutoSkillState(karmaElementId, level, nextCastAt);
    return this.applyClassModifier(baseState, playerClassType);
  }

  /**
   * @date 2026-04-29
   * @desc 카르마 속성과 레벨에 맞는 기본 자동 공격 수치를 계산한다.
   */
  private createBaseAutoSkillState(
    karmaElementId: KarmaElementId,
    level: number,
    nextCastAt: number,
  ): KarmaAutoSkillState {
    if (karmaElementId === "electric") {
      return {
        id: karmaElementId,
        level,
        exp: 0,
        baseCooldownMs: KARMA_ELECTRIC_BASE_COOLDOWN_MS,
        currentCooldownMs: KARMA_ELECTRIC_BASE_COOLDOWN_MS,
        nextCastAt,
        damageMultiplier: 0.65 + level * 0.15,
        hitCount: Math.min(6, level + 1),
        range: KARMA_ELECTRIC_BASE_RANGE + (level - 1) * 12,
        hitboxRadius: KARMA_ELECTRIC_CHAIN_RADIUS + (level - 1) * 8,
      };
    }

    if (karmaElementId === "rock") {
      return {
        id: karmaElementId,
        level,
        exp: 0,
        baseCooldownMs: Math.max(2_200, KARMA_ROCK_BASE_RESPAWN_MS - (level - 1) * 250),
        currentCooldownMs: KARMA_ROCK_BASE_RESPAWN_MS,
        nextCastAt,
        damageMultiplier: 0.75 + level * 0.15,
        hitCount: Math.min(4, 1 + Math.floor(level / 2)),
        range: KARMA_ROCK_BASE_RANGE + (level - 1) * 4,
        hitboxRadius: KARMA_ROCK_HITBOX_RADIUS,
      };
    }

    return {
      id: karmaElementId,
      level,
      exp: 0,
      baseCooldownMs: KARMA_FIRE_BASE_COOLDOWN_MS,
      currentCooldownMs: KARMA_FIRE_BASE_COOLDOWN_MS,
      nextCastAt,
      damageMultiplier: 0.8 + level * 0.2,
      hitCount: Math.min(3, 1 + Math.floor((level - 1) / 2)),
      range: KARMA_FIRE_BASE_RANGE + (level - 1) * 10,
      hitboxRadius: KARMA_FIRE_BASE_HITBOX_RADIUS + (level - 1) * 5,
    };
  }

  /**
   * @date 2026-04-29
   * @desc 직업별 카르마 보정값을 자동 공격 수치에 적용한다.
   */
  private applyClassModifier(
    autoSkillState: KarmaAutoSkillState,
    playerClassType: PlayerClassType,
  ): KarmaAutoSkillState {
    const nextAutoSkillState = { ...autoSkillState };

    if (playerClassType === "warrior") {
      if (nextAutoSkillState.id === "fire") {
        nextAutoSkillState.range = Math.round(nextAutoSkillState.range * 0.9);
        nextAutoSkillState.hitboxRadius = Math.round(nextAutoSkillState.hitboxRadius * 1.15);
      }
      if (nextAutoSkillState.id === "electric") {
        nextAutoSkillState.damageMultiplier *= 1.2;
        nextAutoSkillState.hitboxRadius = Math.round(nextAutoSkillState.hitboxRadius * 0.9);
      }
      if (nextAutoSkillState.id === "rock") {
        nextAutoSkillState.baseCooldownMs = Math.round(nextAutoSkillState.baseCooldownMs * 0.85);
      }
    }

    if (playerClassType === "mage") {
      if (nextAutoSkillState.id === "fire") {
        nextAutoSkillState.damageMultiplier *= 1.15;
        nextAutoSkillState.baseCooldownMs = Math.round(nextAutoSkillState.baseCooldownMs * 1.05);
      }
      if (nextAutoSkillState.id === "electric") {
        nextAutoSkillState.hitboxRadius = Math.round(nextAutoSkillState.hitboxRadius * 1.2);
      }
      if (nextAutoSkillState.id === "rock") {
        nextAutoSkillState.range = Math.round(nextAutoSkillState.range * 1.15);
        nextAutoSkillState.damageMultiplier *= 1.1;
      }
    }

    if (playerClassType === "archer") {
      if (nextAutoSkillState.id === "fire") {
        nextAutoSkillState.range = Math.round(nextAutoSkillState.range * 1.25);
        nextAutoSkillState.hitboxRadius = Math.round(nextAutoSkillState.hitboxRadius * 0.9);
      }
      if (nextAutoSkillState.id === "electric") {
        nextAutoSkillState.range = Math.round(nextAutoSkillState.range * 1.25);
        nextAutoSkillState.damageMultiplier *= 0.95;
      }
      if (nextAutoSkillState.id === "rock") {
        nextAutoSkillState.range = Math.round(nextAutoSkillState.range * 1.1);
        nextAutoSkillState.baseCooldownMs = Math.round(nextAutoSkillState.baseCooldownMs * 1.1);
      }
    }

    nextAutoSkillState.currentCooldownMs = nextAutoSkillState.baseCooldownMs;
    return nextAutoSkillState;
  }

  /**
   * @date 2026-04-29
   * @desc 카르마 레벨별 요구 경험치를 반환한다.
   */
  private getRequiredExp(level: number) {
    if (level <= 2) {
      return 6;
    }

    if (level === 3) {
      return 10;
    }

    if (level === 4) {
      return 15;
    }

    return 15 + (level - 4) * 5;
  }

  /**
   * @date 2026-04-29
   * @desc 카르마 후보 배열을 무작위 순서로 섞는다.
   */
  private shuffleKarmaElementIds(
    karmaElementIds: KarmaElementId[],
    randomProvider: () => number,
  ) {
    const shuffledIds = [...karmaElementIds];
    for (let index = shuffledIds.length - 1; index > 0; index -= 1) {
      const targetIndex = Math.floor(randomProvider() * (index + 1));
      const currentId = shuffledIds[index];
      shuffledIds[index] = shuffledIds[targetIndex];
      shuffledIds[targetIndex] = currentId;
    }

    return shuffledIds;
  }
}
