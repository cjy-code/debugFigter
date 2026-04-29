import Phaser from "phaser";

export type PoolObject = Phaser.GameObjects.GameObject & {
  body?: unknown;
};

export type Poolable<T extends PoolObject> = {
  /**
   * @date 2026-04-29
   * @desc 풀에서 꺼낸 객체를 사용 가능한 상태로 초기화한다.
   */
  init: (poolObject: T) => void;
  /**
   * @date 2026-04-29
   * @desc 풀로 반환되는 객체의 상태를 재사용 가능한 기본값으로 되돌린다.
   */
  reset: (poolObject: T) => void;
};

type PoolConfig<T extends PoolObject> = {
  key: string;
  initialSize: number;
  maxSize: number;
  allowExpansion: boolean;
  create: () => T;
  lifecycle: Poolable<T>;
};

type PoolBucket = {
  key: string;
  inactiveObjects: PoolObject[];
  totalCount: number;
  maxSize: number;
  allowExpansion: boolean;
  create: () => PoolObject;
  lifecycle: Poolable<PoolObject>;
};

/**
 * @date 2026-04-29
 * @desc Phaser 게임 오브젝트를 타입별 스택으로 보관하고 재사용하는 전역 풀 매니저다.
 */
export class PoolManager {
  private static instance: PoolManager | null = null;
  private readonly pools = new Map<string, PoolBucket>();

  /**
   * @date 2026-04-29
   * @desc 전역에서 공유하는 PoolManager 인스턴스를 반환한다.
   */
  static getInstance() {
    if (!PoolManager.instance) {
      PoolManager.instance = new PoolManager();
    }

    return PoolManager.instance;
  }

  /**
   * @date 2026-04-29
   * @desc 지정한 키의 풀을 만들고 초기 수량만큼 비활성 객체를 미리 생성한다.
   */
  preload<T extends PoolObject>(config: PoolConfig<T>) {
    const existingPool = this.pools.get(config.key);
    if (existingPool) {
      this.expandPool(existingPool, config.initialSize);
      return;
    }

    const poolBucket: PoolBucket = {
      key: config.key,
      inactiveObjects: [],
      totalCount: 0,
      maxSize: config.maxSize,
      allowExpansion: config.allowExpansion,
      create: config.create,
      lifecycle: config.lifecycle as Poolable<PoolObject>,
    };
    this.pools.set(config.key, poolBucket);
    this.expandPool(poolBucket, config.initialSize);
  }

  /**
   * @date 2026-04-29
   * @desc 풀에서 객체를 꺼내고 없을 때 확장 정책에 따라 새 객체를 생성한다.
   */
  get<T extends PoolObject>(key: string): T | null {
    const poolBucket = this.pools.get(key);
    if (!poolBucket) {
      return null;
    }

    const poolObject = poolBucket.inactiveObjects.pop() ?? this.createExpandableObject(poolBucket);
    if (!poolObject) {
      return null;
    }

    this.activateObject(poolObject);
    poolBucket.lifecycle.init(poolObject);
    return poolObject as T;
  }

  /**
   * @date 2026-04-29
   * @desc 사용이 끝난 객체를 초기화하고 비활성 스택에 다시 넣는다.
   */
  release<T extends PoolObject>(key: string, poolObject: T) {
    const poolBucket = this.pools.get(key);
    if (!poolBucket || poolBucket.inactiveObjects.includes(poolObject)) {
      return;
    }

    poolBucket.lifecycle.reset(poolObject);
    this.deactivateObject(poolObject);
    poolBucket.inactiveObjects.push(poolObject);
  }

  /**
   * @date 2026-04-29
   * @desc 모든 풀 객체를 제거하고 내부 상태를 초기화한다.
   */
  clear() {
    this.pools.forEach((poolBucket) => {
      poolBucket.inactiveObjects.forEach((poolObject) => {
        poolObject.destroy();
      });
    });
    this.pools.clear();
  }

  /**
   * @date 2026-04-29
   * @desc 풀에 등록된 객체를 요청 수량만큼 추가 생성한다.
   */
  private expandPool(poolBucket: PoolBucket, requestedSize: number) {
    const availableCapacity = Math.max(0, poolBucket.maxSize - poolBucket.totalCount);
    const createCount = Math.min(requestedSize, availableCapacity);

    for (let objectIndex = 0; objectIndex < createCount; objectIndex += 1) {
      const poolObject = poolBucket.create();
      poolBucket.lifecycle.reset(poolObject);
      this.deactivateObject(poolObject);
      poolBucket.inactiveObjects.push(poolObject);
      poolBucket.totalCount += 1;
    }
  }

  /**
   * @date 2026-04-29
   * @desc 동적 확장이 허용된 풀에서 최대 수량 안의 새 객체를 생성한다.
   */
  private createExpandableObject(poolBucket: PoolBucket) {
    if (!poolBucket.allowExpansion || poolBucket.totalCount >= poolBucket.maxSize) {
      return null;
    }

    const poolObject = poolBucket.create();
    poolBucket.totalCount += 1;
    return poolObject;
  }

  /**
   * @date 2026-04-29
   * @desc Phaser 객체와 물리 바디를 활성 상태로 전환한다.
   */
  private activateObject(poolObject: PoolObject) {
    poolObject.setActive(true);
    if ("setVisible" in poolObject && typeof poolObject.setVisible === "function") {
      poolObject.setVisible(true);
    }

    const arcadeBody = poolObject.body as Phaser.Physics.Arcade.Body | undefined;
    if (arcadeBody) {
      arcadeBody.enable = true;
    }
  }

  /**
   * @date 2026-04-29
   * @desc Phaser 객체와 물리 바디를 비활성 상태로 전환한다.
   */
  private deactivateObject(poolObject: PoolObject) {
    poolObject.setActive(false);
    if ("setVisible" in poolObject && typeof poolObject.setVisible === "function") {
      poolObject.setVisible(false);
    }

    const arcadeBody = poolObject.body as Phaser.Physics.Arcade.Body | undefined;
    if (arcadeBody) {
      arcadeBody.stop();
      arcadeBody.enable = false;
    }
  }
}
