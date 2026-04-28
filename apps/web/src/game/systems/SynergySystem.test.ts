import { describe, expect, it } from "vitest";
import { SynergySystem } from "./SynergySystem";

describe("SynergySystem", () => {
  it("화염과 치명타 옵션이 모두 있으면 보너스 피해를 적용한다", () => {
    const synergySystem = new SynergySystem();

    const synergy = synergySystem.evaluate(["화염 전환 부여", "치명타 확률 +10%"]);

    expect(synergy.bonusDamage).toBe(3);
    expect(synergy.description).toContain("시너지");
  });

  it("조건을 만족하지 않으면 기본 시너지를 반환한다", () => {
    const synergySystem = new SynergySystem();

    const synergy = synergySystem.evaluate(["컴파일 속도 +20%"]);

    expect(synergy.bonusDamage).toBe(0);
    expect(synergy.description).toBe("기본 시너지");
  });
});
