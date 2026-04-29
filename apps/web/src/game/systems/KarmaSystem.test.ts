import { describe, expect, it } from "vitest";
import type {
  KarmaAutoSkillState,
  KarmaElementId,
  KarmaElements,
  KarmaSelectionState,
} from "../shared/gameTypes";
import { KarmaSystem } from "./KarmaSystem";

/**
 * @date 2026-04-29
 * @desc 테스트용 카르마 선택 상태를 생성한다.
 */
function createKarmaSelectionState(
  selectedElementIds: KarmaElementId[] = [],
): KarmaSelectionState {
  return {
    selectedElementIds,
    maxSelectedElementCount: 3,
    pendingOptions: [],
  };
}

/**
 * @date 2026-04-29
 * @desc 테스트용 카르마 성장 상태를 생성한다.
 */
function createKarmaElements(): KarmaElements {
  return {
    fire: {
      id: "fire",
      level: 1,
      exp: 0,
      requiredExp: 3,
      damageMultiplier: 1,
      count: 1,
      range: 120,
      hitboxRadius: 48,
    },
    electric: {
      id: "electric",
      level: 1,
      exp: 0,
      requiredExp: 3,
      damageMultiplier: 0.8,
      count: 2,
      range: 180,
      hitboxRadius: 160,
    },
    rock: {
      id: "rock",
      level: 1,
      exp: 0,
      requiredExp: 3,
      damageMultiplier: 0.9,
      count: 1,
      range: 62,
      hitboxRadius: 18,
    },
  };
}

/**
 * @date 2026-04-29
 * @desc 테스트용 카르마 자동 공격 상태를 생성한다.
 */
function createKarmaAutoSkills(): Record<KarmaElementId, KarmaAutoSkillState> {
  return {
    fire: {
      id: "fire",
      level: 1,
      exp: 0,
      baseCooldownMs: 900,
      currentCooldownMs: 900,
      nextCastAt: 0,
      damageMultiplier: 1,
      hitCount: 1,
      range: 120,
      hitboxRadius: 48,
    },
    electric: {
      id: "electric",
      level: 1,
      exp: 0,
      baseCooldownMs: 700,
      currentCooldownMs: 700,
      nextCastAt: 0,
      damageMultiplier: 0.8,
      hitCount: 2,
      range: 180,
      hitboxRadius: 160,
    },
    rock: {
      id: "rock",
      level: 1,
      exp: 0,
      baseCooldownMs: 3_500,
      currentCooldownMs: 3_500,
      nextCastAt: 0,
      damageMultiplier: 0.9,
      hitCount: 1,
      range: 62,
      hitboxRadius: 18,
    },
  };
}

describe("KarmaSystem", () => {
  it("returns selected karma first and fills remaining options", () => {
    const karmaSystem = new KarmaSystem();

    const options = karmaSystem.pickKarmaOptions(createKarmaSelectionState(["fire"]), () => 0);

    expect(options).toContain("fire");
    expect(options.length).toBe(3);
  });

  it("locks options to the selected three karma elements", () => {
    const karmaSystem = new KarmaSystem();

    const options = karmaSystem.pickKarmaOptions(
      createKarmaSelectionState(["fire", "electric", "rock"]),
      () => 0,
    );

    expect(options).toEqual(["fire", "electric", "rock"]);
  });

  it("adds a new selected karma while slots are open", () => {
    const karmaSystem = new KarmaSystem();

    const selectionState = karmaSystem.applyKarmaSelection(
      createKarmaSelectionState(["fire"]),
      "electric",
    );

    expect(selectionState.selectedElementIds).toEqual(["fire", "electric"]);
  });

  it("does not add unselected karma after three slots are fixed", () => {
    const karmaSystem = new KarmaSystem();

    const selectionState = karmaSystem.applyKarmaSelection(
      createKarmaSelectionState(["fire", "electric", "rock"]),
      "fire",
    );

    expect(selectionState.selectedElementIds).toEqual(["fire", "electric", "rock"]);
  });

  it("levels up karma and updates auto skill values", () => {
    const karmaSystem = new KarmaSystem();
    const karmaElements = createKarmaElements();
    const karmaAutoSkills = createKarmaAutoSkills();

    const grantResult = karmaSystem.grantKarmaExp(
      karmaElements,
      karmaAutoSkills,
      "fire",
      3,
      "warrior",
    );

    expect(grantResult.leveledUp).toBe(true);
    expect(grantResult.element.level).toBe(2);
    expect(karmaAutoSkills.fire.level).toBe(2);
    expect(karmaAutoSkills.fire.damageMultiplier).toBeGreaterThan(1);
  });

  it("applies attack speed multiplier to karma cooldown", () => {
    const karmaSystem = new KarmaSystem();

    const cooldown = karmaSystem.computeCurrentCooldown(900, 0.5);

    expect(cooldown).toBe(450);
  });

  it("returns configured drop rates by monster grade", () => {
    const karmaSystem = new KarmaSystem();

    expect(karmaSystem.getDropRate("normal")).toBe(0.12);
    expect(karmaSystem.getDropRate("enhanced")).toBe(0.25);
    expect(karmaSystem.getDropRate("elite")).toBe(1);
    expect(karmaSystem.getDropRate("boss")).toBe(1);
  });
});
