type SynergyResult = {
  description: string;
  bonusDamage: number;
};

/**
 * @date 2026-04-23
 * @desc 선택된 강화 조합에 따른 시너지 효과를 계산한다.
 */
export class SynergySystem {
  /**
   * @date 2026-04-23
   * @desc 현재 선택된 옵션 목록에서 단일 시너지를 찾아 반환한다.
   */
  evaluate(selectedOptions: string[]) {
    const hasFlame = selectedOptions.some((optionName) => optionName.includes("화염"));
    const hasCritical = selectedOptions.some((optionName) => optionName.includes("치명"));

    if (hasFlame && hasCritical) {
      const result: SynergyResult = {
        description: "화염 치명 시너지 활성화",
        bonusDamage: 3,
      };
      return result;
    }

    const result: SynergyResult = {
      description: "기본 시너지",
      bonusDamage: 0,
    };
    return result;
  }
}
