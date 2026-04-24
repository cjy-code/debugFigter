import type { RunResult } from "../shared/gameTypes";

const SAVE_KEY = "debug-fighter-progression";

type ProgressionData = {
  runCount: number;
  clearCount: number;
  bonusAttack: number;
};

/**
 * @date 2026-04-23
 * @desc 로컬 스토리지 기반 영구 성장 데이터를 관리한다.
 */
export class SaveService {
  /**
   * @date 2026-04-23
   * @desc 저장된 영구 성장 데이터를 읽거나 기본값을 생성한다.
   */
  loadProgression(): ProgressionData {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
      return {
        runCount: 0,
        clearCount: 0,
        bonusAttack: 0,
      };
    }

    try {
      return JSON.parse(saved) as ProgressionData;
    } catch {
      return {
        runCount: 0,
        clearCount: 0,
        bonusAttack: 0,
      };
    }
  }

  /**
   * @date 2026-04-23
   * @desc 런 결과를 반영해 영구 성장 데이터를 갱신한다.
   */
  saveRunResult(result: RunResult) {
    const previousData = this.loadProgression();
    const nextData: ProgressionData = {
      ...previousData,
      runCount: previousData.runCount + 1,
      clearCount: result === "clear" ? previousData.clearCount + 1 : previousData.clearCount,
      bonusAttack: result === "clear" ? previousData.bonusAttack + 1 : previousData.bonusAttack,
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(nextData));
    return nextData;
  }
}
