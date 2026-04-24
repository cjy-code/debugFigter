import skillOptions from "../data/skills.json";
import type { PlayerState } from "../shared/gameTypes";

/**
 * @date 2026-04-23
 * @desc 레벨과 경험치, 레벨업 선택지를 관리한다.
 */
export class ProgressionSystem {
  /**
   * @date 2026-04-24
   * @desc 현재 레벨에서 다음 레벨에 필요한 경험치를 계산한다.
   */
  getRequiredExp(playerState: PlayerState) {
    return playerState.level * 10;
  }

  /**
   * @date 2026-04-23
   * @desc 플레이어에게 경험치를 지급한다.
   */
  grantExp(playerState: PlayerState, amount: number) {
    playerState.exp += amount;
  }

  /**
   * @date 2026-04-23
   * @desc 레벨업 가능 여부를 판단한다.
   */
  canLevelUp(playerState: PlayerState) {
    const requiredExp = this.getRequiredExp(playerState);
    return playerState.exp >= requiredExp;
  }

  /**
   * @date 2026-04-23
   * @desc 레벨업을 적용하고 현재 레벨 기준 요구 경험치를 차감한다.
   */
  applyLevelUp(playerState: PlayerState) {
    const requiredExp = this.getRequiredExp(playerState);
    playerState.exp = Math.max(0, playerState.exp - requiredExp);
    playerState.level += 1;
    playerState.damage += 2;
    playerState.maxHp += 5;
    playerState.hp = Math.min(playerState.maxHp, playerState.hp + 5);
  }

  /**
   * @date 2026-04-23
   * @desc 레벨업 선택지 3개를 랜덤으로 추출한다.
   */
  pickLevelUpOptions() {
    const copied = [...skillOptions];
    copied.sort(() => Math.random() - 0.5);
    return copied.slice(0, 3);
  }
}
