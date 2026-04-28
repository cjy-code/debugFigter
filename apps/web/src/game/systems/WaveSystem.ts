import {
  WAVE_ELITE_DENSE_INTERVAL_MS,
  WAVE_ELITE_DENSE_SPAWN_COUNT,
  WAVE_ELITE_START_MS,
  WAVE_ENHANCED_INTERVAL_MS,
  WAVE_ENHANCED_SPAWN_COUNT,
  WAVE_ENHANCED_START_MS,
  WAVE_EXTREME_INTERVAL_MS,
  WAVE_EXTREME_SPAWN_COUNT,
  WAVE_EXTREME_START_MS,
  WAVE_INCREASED_DENSITY_END_MS,
  WAVE_INCREASED_DENSITY_INTERVAL_MS,
  WAVE_INCREASED_DENSITY_SPAWN_COUNT,
  WAVE_LOW_DENSITY_END_MS,
  WAVE_LOW_DENSITY_INTERVAL_MS,
  WAVE_LOW_DENSITY_SPAWN_COUNT,
} from "../constants/gameConstants";

export type WaveConfig = {
  spawnIntervalMs: number;
  spawnCount: number;
};

/**
 * @date 2026-04-28
 * @desc 생존 시간에 맞는 웨이브 스폰 간격과 수량을 반환한다.
 */
export function getWaveConfigByElapsedMs(survivalElapsedMs: number): WaveConfig {
  if (survivalElapsedMs >= WAVE_EXTREME_START_MS) {
    return {
      spawnIntervalMs: WAVE_EXTREME_INTERVAL_MS,
      spawnCount: WAVE_EXTREME_SPAWN_COUNT,
    };
  }

  if (survivalElapsedMs >= WAVE_ELITE_START_MS) {
    return {
      spawnIntervalMs: WAVE_ELITE_DENSE_INTERVAL_MS,
      spawnCount: WAVE_ELITE_DENSE_SPAWN_COUNT,
    };
  }

  if (survivalElapsedMs >= WAVE_ENHANCED_START_MS) {
    return {
      spawnIntervalMs: WAVE_ENHANCED_INTERVAL_MS,
      spawnCount: WAVE_ENHANCED_SPAWN_COUNT,
    };
  }

  if (
    survivalElapsedMs >= WAVE_LOW_DENSITY_END_MS &&
    survivalElapsedMs < WAVE_INCREASED_DENSITY_END_MS
  ) {
    return {
      spawnIntervalMs: WAVE_INCREASED_DENSITY_INTERVAL_MS,
      spawnCount: WAVE_INCREASED_DENSITY_SPAWN_COUNT,
    };
  }

  return {
    spawnIntervalMs: WAVE_LOW_DENSITY_INTERVAL_MS,
    spawnCount: WAVE_LOW_DENSITY_SPAWN_COUNT,
  };
}
