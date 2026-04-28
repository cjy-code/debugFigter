import { beforeEach, describe, expect, it } from "vitest";
import type { RunResult } from "../shared/gameTypes";
import { SaveService } from "./SaveService";

type StorageRecord = Record<string, string>;

const SAVE_KEY_CURRENT = "debug-fighter-record";
const SAVE_KEY_LEGACY = "debug-fighter-progression";

/**
 * @date 2026-04-27
 * @desc 테스트용 localStorage 모킹 객체를 생성한다.
 */
function createMockStorage() {
  const store: StorageRecord = {};

  return {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach((key) => {
        delete store[key];
      });
    },
  };
}

/**
 * @date 2026-04-27
 * @desc 테스트 실행 전 global localStorage를 모킹 객체로 교체한다.
 */
function installMockStorage() {
  const mockStorage = createMockStorage();
  Object.defineProperty(globalThis, "localStorage", {
    value: mockStorage,
    configurable: true,
    writable: true,
  });
}

/**
 * @date 2026-04-27
 * @desc 지정한 저장 키에 JSON 직렬화 값을 기록한다.
 */
function writeStorage(key: string, data: unknown) {
  globalThis.localStorage.setItem(key, JSON.stringify(data));
}

describe("SaveService", () => {
  beforeEach(() => {
    installMockStorage();
  });

  it("저장 데이터가 없으면 기본 런 기록을 반환한다", () => {
    const saveService = new SaveService();

    const runRecord = saveService.loadRunRecord();

    expect(runRecord).toEqual({ runCount: 0, clearCount: 0 });
  });

  it("현재 스키마(v1) 저장 데이터가 있으면 해당 값을 로드한다", () => {
    const saveService = new SaveService();
    writeStorage(SAVE_KEY_CURRENT, { version: 1, runRecord: { runCount: 7, clearCount: 2 } });

    const runRecord = saveService.loadRunRecord();

    expect(runRecord).toEqual({ runCount: 7, clearCount: 2 });
  });

  it("현재 키의 구형 형식을 읽으면 v1 스키마로 마이그레이션 저장한다", () => {
    const saveService = new SaveService();
    writeStorage(SAVE_KEY_CURRENT, { runCount: 3, clearCount: 1 });

    const runRecord = saveService.loadRunRecord();
    const migrated = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY_CURRENT) ?? "{}") as {
      version?: number;
      runRecord?: { runCount?: number; clearCount?: number };
    };

    expect(runRecord).toEqual({ runCount: 3, clearCount: 1 });
    expect(migrated.version).toBe(1);
    expect(migrated.runRecord).toEqual({ runCount: 3, clearCount: 1 });
  });

  it("레거시 키 데이터가 있으면 현재 키로 마이그레이션한다", () => {
    const saveService = new SaveService();
    writeStorage(SAVE_KEY_LEGACY, { runCount: 9, clearCount: 4, bonusAttack: 10 });

    const runRecord = saveService.loadRunRecord();
    const migrated = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY_CURRENT) ?? "{}") as {
      version?: number;
      runRecord?: { runCount?: number; clearCount?: number };
    };

    expect(runRecord).toEqual({ runCount: 9, clearCount: 4 });
    expect(migrated.version).toBe(1);
    expect(migrated.runRecord).toEqual({ runCount: 9, clearCount: 4 });
  });

  it("런 결과 저장 시 runCount는 증가하고 clear만 clearCount를 증가시킨다", () => {
    const saveService = new SaveService();

    const deadResult = saveService.saveRunResult("dead" as RunResult);
    const clearResult = saveService.saveRunResult("clear" as RunResult);

    expect(deadResult).toEqual({ runCount: 1, clearCount: 0 });
    expect(clearResult).toEqual({ runCount: 2, clearCount: 1 });
  });
});
