import type { RunResult } from "../shared/gameTypes";

const SAVE_KEY_CURRENT = "debug-fighter-record";
const SAVE_KEY_LEGACY = "debug-fighter-progression";
const SAVE_SCHEMA_VERSION = 1;

type RunRecordData = {
  runCount: number;
  clearCount: number;
};

type SaveSchemaV1 = {
  version: 1;
  runRecord: RunRecordData;
};

/**
 * @date 2026-04-27
 * @desc 로컬 스토리지 기반 런 기록 데이터 저장/복원과 스키마 마이그레이션을 관리한다.
 */
export class SaveService {
  /**
   * @date 2026-04-27
   * @desc 런 기록 데이터 기본값을 생성한다.
   */
  private createDefaultRecordData(): RunRecordData {
    return {
      runCount: 0,
      clearCount: 0,
    };
  }

  /**
   * @date 2026-04-27
   * @desc 현재 런 기록을 표준 스키마(v1)로 래핑한다.
   */
  private createSchemaV1(runRecord: RunRecordData): SaveSchemaV1 {
    return {
      version: SAVE_SCHEMA_VERSION,
      runRecord,
    };
  }

  /**
   * @date 2026-04-27
   * @desc 입력 데이터가 런 기록 데이터 형식인지 검증한다.
   */
  private isRunRecordData(value: unknown): value is RunRecordData {
    if (!value || typeof value !== "object") {
      return false;
    }

    const record = value as Partial<RunRecordData>;
    return typeof record.runCount === "number" && typeof record.clearCount === "number";
  }

  /**
   * @date 2026-04-27
   * @desc 입력 객체에서 런 기록에 필요한 필드만 추출해 정규화한다.
   */
  private normalizeRunRecordData(value: RunRecordData): RunRecordData {
    return {
      runCount: value.runCount,
      clearCount: value.clearCount,
    };
  }

  /**
   * @date 2026-04-27
   * @desc 입력 데이터가 현재 스키마(v1) 형식인지 검증한다.
   */
  private isSchemaV1(value: unknown): value is SaveSchemaV1 {
    if (!value || typeof value !== "object") {
      return false;
    }

    const schema = value as Partial<SaveSchemaV1>;
    return schema.version === 1 && this.isRunRecordData(schema.runRecord);
  }

  /**
   * @date 2026-04-27
   * @desc 구형/레거시 저장 데이터를 현재 런 기록 형식으로 마이그레이션한다.
   */
  private migrateToRunRecordData(value: unknown) {
    if (this.isSchemaV1(value)) {
      return this.normalizeRunRecordData(value.runRecord);
    }

    if (this.isRunRecordData(value)) {
      return this.normalizeRunRecordData(value);
    }

    return null;
  }

  /**
   * @date 2026-04-27
   * @desc 현재 키에 런 기록을 현재 스키마(v1)로 저장한다.
   */
  private persistRunRecordData(runRecord: RunRecordData) {
    const nextSchema = this.createSchemaV1(runRecord);
    localStorage.setItem(SAVE_KEY_CURRENT, JSON.stringify(nextSchema));
  }

  /**
   * @date 2026-04-27
   * @desc 저장된 런 기록을 로드하고 필요하면 마이그레이션한 뒤 반환한다.
   */
  loadRunRecord(): RunRecordData {
    const currentRaw = localStorage.getItem(SAVE_KEY_CURRENT);
    if (currentRaw) {
      try {
        const parsedCurrent = JSON.parse(currentRaw) as unknown;
        const migratedCurrent = this.migrateToRunRecordData(parsedCurrent);
        if (migratedCurrent) {
          if (!this.isSchemaV1(parsedCurrent)) {
            this.persistRunRecordData(migratedCurrent);
          }
          return migratedCurrent;
        }
      } catch {
        return this.createDefaultRecordData();
      }
    }

    const legacyRaw = localStorage.getItem(SAVE_KEY_LEGACY);
    if (legacyRaw) {
      try {
        const parsedLegacy = JSON.parse(legacyRaw) as unknown;
        const migratedLegacy = this.migrateToRunRecordData(parsedLegacy);
        if (migratedLegacy) {
          this.persistRunRecordData(migratedLegacy);
          return migratedLegacy;
        }
      } catch {
        return this.createDefaultRecordData();
      }
    }

    return this.createDefaultRecordData();
  }

  /**
   * @date 2026-04-27
   * @desc 런 결과를 반영해 누적 런 기록을 저장한다.
   */
  saveRunResult(result: RunResult) {
    const previousData = this.loadRunRecord();
    const nextData: RunRecordData = {
      runCount: previousData.runCount + 1,
      clearCount: result === "clear" ? previousData.clearCount + 1 : previousData.clearCount,
    };

    this.persistRunRecordData(nextData);
    return nextData;
  }
}
