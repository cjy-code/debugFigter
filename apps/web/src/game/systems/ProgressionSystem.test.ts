import { describe, expect, it } from "vitest";
import { createInitialPlayerState } from "../constants/gameConstants";
import statUpgrades from "../data/statUpgrades.json";
import type { LevelUpOption, PlayerState, StatStacks } from "../shared/gameTypes";
import { ProgressionSystem } from "./ProgressionSystem";

/**
 * @date 2026-04-28
 * @desc 테스트용 기본 스탯 스택 객체를 생성한다.
 */
function createStatStacks(overrides?: Partial<StatStacks>): StatStacks {
  return {
    attackSpeed: 0,
    expGain: 0,
    attackCount: 0,
    damage: 0,
    criticalChance: 0,
    criticalDamage: 0,
    moveSpeed: 0,
    attackRange: 0,
    ...overrides,
  };
}

/**
 * @date 2026-04-27
 * @desc 테스트용 플레이어 상태를 생성한다.
 */
function createPlayerState(overrides?: Partial<PlayerState>): PlayerState {
  return {
    ...createInitialPlayerState("warrior"),
    statStacks: createStatStacks(),
    ...overrides,
  };
}

describe("ProgressionSystem", () => {
  it("calculates required exp from player level", () => {
    const progressionSystem = new ProgressionSystem();

    const requiredExp = progressionSystem.getRequiredExp(createPlayerState({ level: 3 }));

    expect(requiredExp).toBe(30);
  });

  it("returns true when exp reaches the required level-up amount", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({ level: 2, exp: 20 });

    const canLevelUp = progressionSystem.canLevelUp(playerState);

    expect(canLevelUp).toBe(true);
  });

  it("applies level-up while preserving current combat stats", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({
      level: 2,
      exp: 25,
      hp: 90,
      maxHp: 100,
      damage: 10,
    });

    progressionSystem.applyLevelUp(playerState);

    expect(playerState.level).toBe(3);
    expect(playerState.exp).toBe(5);
    expect(playerState.damage).toBe(10);
    expect(playerState.maxHp).toBe(100);
    expect(playerState.hp).toBe(90);
  });

  it("increments the selected stat stack and recalculates derived stats", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({ level: 1, exp: 10 });
    const option = statUpgrades.find((upgrade) => upgrade.id === "damage") as LevelUpOption;

    progressionSystem.applyLevelUp(playerState, option);

    expect(playerState.statStacks.damage).toBe(1);
    expect(playerState.damage).toBe(15);
  });

  it("uses soft-cap attack speed scaling after 30 stacks", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({
      statStacks: createStatStacks({ attackSpeed: 31 }),
    });

    progressionSystem.recalculateStackedStats(playerState);

    expect(playerState.cooldownMultiplier).toBeCloseTo(0.636);
  });

  it("adds one attack count every 12 attack count stacks", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({
      statStacks: createStatStacks({ attackCount: 24 }),
    });

    progressionSystem.recalculateStackedStats(playerState);

    expect(playerState.attackCount).toBe(3);
  });

  it("returns up to three level-up options", () => {
    const progressionSystem = new ProgressionSystem();

    const options = progressionSystem.pickLevelUpOptions();

    expect(options.length).toBeLessThanOrEqual(3);
    options.forEach((option) => {
      expect(statUpgrades.some((upgrade) => upgrade.id === option.id)).toBe(true);
    });
  });

  it("supports deterministic level-up option selection", () => {
    const fixedRandom = () => 0.9999;
    const progressionSystem = new ProgressionSystem(fixedRandom);

    const options = progressionSystem.pickLevelUpOptions();

    expect(options.map((option) => option.id)).toEqual(
      statUpgrades.slice(0, 3).map((option) => option.id),
    );
  });
});
