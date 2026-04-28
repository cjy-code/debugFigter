import { describe, expect, it } from "vitest";
import { CombatSystem } from "./CombatSystem";

describe("CombatSystem", () => {
  it("현재 HP에서 피해량만큼 차감한다", () => {
    const combatSystem = new CombatSystem();

    const nextHp = combatSystem.applyDamage(30, 12);

    expect(nextHp).toBe(18);
  });

  it("피해량이 현재 HP보다 커도 최소 0으로 제한한다", () => {
    const combatSystem = new CombatSystem();

    const nextHp = combatSystem.applyDamage(10, 99);

    expect(nextHp).toBe(0);
  });

  it("HP가 0 이하이면 사망 상태로 판정한다", () => {
    const combatSystem = new CombatSystem();

    expect(combatSystem.isDead(0)).toBe(true);
    expect(combatSystem.isDead(-1)).toBe(true);
    expect(combatSystem.isDead(1)).toBe(false);
  });
});
