import { describe, expect, it } from "vitest";
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
  WAVE_INCREASED_DENSITY_INTERVAL_MS,
  WAVE_INCREASED_DENSITY_SPAWN_COUNT,
  WAVE_LOW_DENSITY_INTERVAL_MS,
  WAVE_LOW_DENSITY_SPAWN_COUNT,
} from "../constants/gameConstants";
import { getWaveConfigByElapsedMs } from "./WaveSystem";

describe("getWaveConfigByElapsedMs", () => {
  it("0~3분 구간은 낮은 밀도 웨이브 설정을 반환한다", () => {
    const waveConfig = getWaveConfigByElapsedMs(0);

    expect(waveConfig).toEqual({
      spawnIntervalMs: WAVE_LOW_DENSITY_INTERVAL_MS,
      spawnCount: WAVE_LOW_DENSITY_SPAWN_COUNT,
    });
  });

  it("3~6분 구간은 증가 밀도 웨이브 설정을 반환한다", () => {
    const waveConfig = getWaveConfigByElapsedMs(180_000);

    expect(waveConfig).toEqual({
      spawnIntervalMs: WAVE_INCREASED_DENSITY_INTERVAL_MS,
      spawnCount: WAVE_INCREASED_DENSITY_SPAWN_COUNT,
    });
  });

  it("6~10분 구간은 강화 몬스터 웨이브 설정을 반환한다", () => {
    const waveConfig = getWaveConfigByElapsedMs(WAVE_ENHANCED_START_MS);

    expect(waveConfig).toEqual({
      spawnIntervalMs: WAVE_ENHANCED_INTERVAL_MS,
      spawnCount: WAVE_ENHANCED_SPAWN_COUNT,
    });
  });

  it("10~15분 구간은 엘리트 밀집 웨이브 설정을 반환한다", () => {
    const waveConfig = getWaveConfigByElapsedMs(WAVE_ELITE_START_MS);

    expect(waveConfig).toEqual({
      spawnIntervalMs: WAVE_ELITE_DENSE_INTERVAL_MS,
      spawnCount: WAVE_ELITE_DENSE_SPAWN_COUNT,
    });
  });

  it("15분 이후는 극한 밀도 웨이브 설정을 반환한다", () => {
    const waveConfig = getWaveConfigByElapsedMs(WAVE_EXTREME_START_MS);

    expect(waveConfig).toEqual({
      spawnIntervalMs: WAVE_EXTREME_INTERVAL_MS,
      spawnCount: WAVE_EXTREME_SPAWN_COUNT,
    });
  });
});
