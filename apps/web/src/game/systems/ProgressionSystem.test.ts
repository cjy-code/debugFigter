import { describe, expect, it } from "vitest";
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
 * @date 2026-04-28
 * @desc 테스트용 기본 카르마 보유량 객체를 생성한다.
 */
function createKarmaCounts() {
  return {
    fire: 0,
    water: 0,
    wind: 0,
    rock: 0,
    dark: 0,
    holy: 0,
    transformShard: 0,
  };
}

/**
 * @date 2026-04-27
 * @desc 테스트용 플레이어 상태를 생성한다.
 */
function createPlayerState(overrides?: Partial<PlayerState>): PlayerState {
  return {
    classType: "warrior",
    level: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    baseDamage: 10,
    damage: 10,
    baseAttackRange: 88,
    attackRange: 88,
    moveSpeed: 260,
    pickupRadius: 80,
    cooldownMultiplier: 1,
    areaMultiplier: 1,
    expMultiplier: 1,
    criticalChance: 0.05,
    criticalDamageMultiplier: 1.5,
    attackCount: 1,
    statStacks: createStatStacks(),
    karmaCounts: createKarmaCounts(),
    skills: [],
    passives: [],
    ...overrides,
  };
}

describe("ProgressionSystem", () => {
  it("레벨 기준 필요 경험치를 계산한다", () => {
    const progressionSystem = new ProgressionSystem();

    const requiredExp = progressionSystem.getRequiredExp(createPlayerState({ level: 3 }));

    expect(requiredExp).toBe(30);
  });

  it("필요 경험치 이상이면 레벨업 가능 상태를 반환한다", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({ level: 2, exp: 20 });

    const canLevelUp = progressionSystem.canLevelUp(playerState);

    expect(canLevelUp).toBe(true);
  });

  it("레벨업 적용 시 레벨과 경험치를 규칙대로 갱신한다", () => {
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

  it("스탯 선택 시 해당 스택을 증가시키고 파생 스탯을 갱신한다", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({ level: 1, exp: 10 });
    const option = statUpgrades.find((upgrade) => upgrade.id === "damage") as LevelUpOption;

    progressionSystem.applyLevelUp(playerState, option);

    expect(playerState.statStacks.damage).toBe(1);
    expect(playerState.damage).toBe(10);
  });

  it("공격속도는 30스택 이후 소프트캡을 적용한다", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({
      statStacks: createStatStacks({ attackSpeed: 31 }),
    });

    progressionSystem.recalculateStackedStats(playerState);

    expect(playerState.cooldownMultiplier).toBeCloseTo(0.636);
  });

  it("공격 개수는 12스택마다 1개 증가한다", () => {
    const progressionSystem = new ProgressionSystem();
    const playerState = createPlayerState({
      statStacks: createStatStacks({ attackCount: 24 }),
    });

    progressionSystem.recalculateStackedStats(playerState);

    expect(playerState.attackCount).toBe(3);
  });

  it("레벨업 선택지는 최대 3개이며 스탯 목록에 포함된 값만 반환한다", () => {
    const progressionSystem = new ProgressionSystem();

    const options = progressionSystem.pickLevelUpOptions();

    expect(options.length).toBeLessThanOrEqual(3);
    options.forEach((option) => {
      expect(statUpgrades.some((upgrade) => upgrade.id === option.id)).toBe(true);
    });
  });

  it("랜덤 소스를 주입하면 선택지 결과를 재현 가능하게 검증할 수 있다", () => {
    const fixedRandom = () => 0.9999;
    const progressionSystem = new ProgressionSystem(fixedRandom);

    const options = progressionSystem.pickLevelUpOptions();

    expect(options.map((option) => option.id)).toEqual(
      statUpgrades.slice(0, 3).map((option) => option.id),
    );
  });
});
