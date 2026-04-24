/**
 * @date 2026-04-23
 * @desc 전투 대미지 계산과 생존 판정을 담당한다.
 */
export class CombatSystem {
  /**
   * @date 2026-04-23
   * @desc 대상 체력에서 대미지를 차감하고 0 미만으로 내려가지 않게 제한한다.
   */
  applyDamage(currentHp: number, damage: number) {
    return Math.max(0, currentHp - damage);
  }

  /**
   * @date 2026-04-23
   * @desc 체력이 0 이하인지 검사하여 생존 여부를 반환한다.
   */
  isDead(currentHp: number) {
    return currentHp <= 0;
  }
}
