type SynergyResult = {
  description: string;
  bonusDamage: number;
};

/**
 * @date 2026-04-27
 * @desc 선택한 강화 조합의 시너지 효과를 계산한다.
 */
export class SynergySystem {
  /**
   * @date 2026-04-27
   * @desc 선택 옵션 목록에서 적용 가능한 시너지 1개를 계산해 반환한다.
   */
  evaluate(selectedOptions: string[]) {
    const hasFlame = selectedOptions.some((optionName) => optionName.includes("화염"));
    const hasCritical = selectedOptions.some((optionName) => optionName.includes("치명타"));

    if (hasFlame && hasCritical) {
      const result: SynergyResult = {
        description: "화염 치명타 시너지 활성",
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
