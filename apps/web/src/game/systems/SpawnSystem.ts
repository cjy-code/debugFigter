import Phaser from "phaser";
import monsters from "../data/monsters.json";
import {
  BASE_EXP_REWARD,
  WAVE_ELITE_START_MS,
  WAVE_ENHANCED_START_MS,
  WAVE_EXTREME_START_MS,
  WAVE_LOW_DENSITY_END_MS,
  MONSTER_HEIGHT,
  MONSTER_SPAWN_MAX_DISTANCE_FROM_PLAYER,
  MONSTER_SPAWN_MIN_DISTANCE_FROM_PLAYER,
  MONSTER_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../constants/gameConstants";
import type { MonsterGrade } from "../shared/gameTypes";
import { PoolManager, type Poolable } from "./PoolManager";
import { getWaveConfigByElapsedMs, type WaveConfig } from "./WaveSystem";

type MonsterData = {
  name: string;
  textureKey?: string;
  maxHp: number;
  damage: number;
  moveSpeed: number;
  expCoefficient: number;
};

type MonsterGradeModifier = {
  hpMultiplier: number;
  damageMultiplier: number;
  speedMultiplier: number;
  expMultiplier: number;
  color: number;
  scale: number;
  namePrefix: string;
};

type MonsterGameObject = Phaser.GameObjects.Rectangle | Phaser.Physics.Arcade.Sprite;

const MONSTER_POOL_BASE_SIZE = 120;
const MONSTER_POOL_MID_SIZE = 200;
const MONSTER_POOL_LATE_SIZE = 300;
const MONSTER_POOL_MAX_SIZE = 360;

const MONSTER_GRADE_MODIFIERS: Record<MonsterGrade, MonsterGradeModifier> = {
  normal: {
    hpMultiplier: 1,
    damageMultiplier: 1,
    speedMultiplier: 1,
    expMultiplier: 1,
    color: 0xef4444,
    scale: 1,
    namePrefix: "",
  },
  enhanced: {
    hpMultiplier: 1.65,
    damageMultiplier: 1.25,
    speedMultiplier: 1.05,
    expMultiplier: 2.2,
    color: 0xf97316,
    scale: 1.12,
    namePrefix: "Enhanced ",
  },
  elite: {
    hpMultiplier: 4.5,
    damageMultiplier: 1.8,
    speedMultiplier: 0.82,
    expMultiplier: 6,
    color: 0xa855f7,
    scale: 1.45,
    namePrefix: "Elite ",
  },
};

/**
 * @date 2026-04-27
 * @desc 플레이어 기준으로 몬스터 스폰 좌표와 스탯을 구성한다.
 */
export class SpawnSystem {
  /**
   * @date 2026-04-29
   * @desc 생존 시간 기준 예상 몬스터 수량만큼 몬스터 풀을 미리 생성한다.
   */
  preloadMonsterPool(scene: Phaser.Scene, poolManager: PoolManager, survivalElapsedMs: number) {
    const initialPoolSize = this.computeMonsterPoolInitialSize(survivalElapsedMs);
    const preloadCountByMonster = Math.max(1, Math.ceil(initialPoolSize / monsters.length));

    monsters.forEach((monsterData) => {
      const typedMonsterData = monsterData as MonsterData;
      poolManager.preload<MonsterGameObject>({
        key: this.getMonsterPoolKey(typedMonsterData),
        initialSize: preloadCountByMonster,
        maxSize: MONSTER_POOL_MAX_SIZE,
        allowExpansion: true,
        create: () => this.createMonsterGameObject(scene, 0, 0, typedMonsterData, MONSTER_GRADE_MODIFIERS.normal),
        lifecycle: this.createMonsterPoolLifecycle(),
      });
    });
  }

  /**
   * @date 2026-04-27
   * @desc 플레이어 주변 월드 좌표에 몬스터를 스폰한다.
   */
  spawnMonster(
    scene: Phaser.Scene,
    playerX: number,
    playerY: number,
    survivalElapsedMs: number,
    forcedGrade?: MonsterGrade,
    poolManager?: PoolManager,
  ) {
    const pickedMonster = monsters[Math.floor(Math.random() * monsters.length)] as MonsterData;
    const monsterGrade = forcedGrade ?? this.pickMonsterGrade(survivalElapsedMs);
    const gradeModifier = MONSTER_GRADE_MODIFIERS[monsterGrade];
    const spawnPosition = this.computeSpawnPosition(playerX, playerY);
    const monster =
      this.getMonsterFromPool(pickedMonster, poolManager) ??
      this.createMonsterGameObject(scene, spawnPosition.x, spawnPosition.y, pickedMonster, gradeModifier);

    this.applyMonsterVisual(monster, pickedMonster, gradeModifier);
    monster.setPosition(spawnPosition.x, spawnPosition.y);
    const body = monster.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    const maxHp = Math.round(pickedMonster.maxHp * gradeModifier.hpMultiplier);
    monster.setData("name", `${gradeModifier.namePrefix}${pickedMonster.name}`);
    monster.setData("grade", monsterGrade);
    monster.setData("hp", maxHp);
    monster.setData("maxHp", maxHp);
    monster.setData("damage", Math.round(pickedMonster.damage * gradeModifier.damageMultiplier));
    monster.setData("moveSpeed", Math.round(pickedMonster.moveSpeed * gradeModifier.speedMultiplier));
    monster.setData(
      "expReward",
      this.computeMonsterExpReward(pickedMonster.expCoefficient, gradeModifier.expMultiplier),
    );

    return monster;
  }

  /**
   * @date 2026-04-29
   * @desc 몬스터 객체를 Destroy 대신 풀로 반환한다.
   */
  releaseMonster(poolManager: PoolManager, monster: MonsterGameObject) {
    const poolKey = String(monster.getData("poolKey") ?? "");
    if (!poolKey) {
      monster.destroy();
      return;
    }

    poolManager.release(poolKey, monster);
  }

  /**
   * @date 2026-04-29
   * @desc 몬스터 데이터에 에셋 키가 있으면 스프라이트로, 없으면 기존 색상 박스로 생성한다.
   */
  private createMonsterGameObject(
    scene: Phaser.Scene,
    x: number,
    y: number,
    monsterData: MonsterData,
    gradeModifier: MonsterGradeModifier,
  ) {
    if (!monsterData.textureKey) {
      const rectangleMonster = scene.add.rectangle(
        x,
        y,
        MONSTER_WIDTH * gradeModifier.scale,
        MONSTER_HEIGHT * gradeModifier.scale,
        gradeModifier.color,
      );
      scene.physics.add.existing(rectangleMonster);
      return rectangleMonster;
    }

    const spriteMonster = scene.physics.add.sprite(x, y, monsterData.textureKey);
    spriteMonster.setDisplaySize(MONSTER_WIDTH * gradeModifier.scale, MONSTER_HEIGHT * gradeModifier.scale);
    if (gradeModifier.namePrefix) {
      spriteMonster.setTint(gradeModifier.color);
    }
    spriteMonster.setDepth(10);
    const spriteBody = spriteMonster.body as Phaser.Physics.Arcade.Body;
    spriteBody.setSize(MONSTER_WIDTH, MONSTER_HEIGHT);
    return spriteMonster;
  }

  /**
   * @date 2026-04-29
   * @desc 몬스터 데이터에 맞는 풀 키를 반환한다.
   */
  private getMonsterPoolKey(monsterData: MonsterData) {
    return monsterData.textureKey ? `monster:sprite:${monsterData.textureKey}` : "monster:rectangle";
  }

  /**
   * @date 2026-04-29
   * @desc 풀에 저장된 몬스터 객체를 반환한다.
   */
  private getMonsterFromPool(monsterData: MonsterData, poolManager?: PoolManager) {
    if (!poolManager) {
      return null;
    }

    return poolManager.get<MonsterGameObject>(this.getMonsterPoolKey(monsterData));
  }

  /**
   * @date 2026-04-29
   * @desc 재사용 몬스터에 등급별 크기, 색상, 물리 바디 값을 다시 적용한다.
   */
  private applyMonsterVisual(
    monster: MonsterGameObject,
    monsterData: MonsterData,
    gradeModifier: MonsterGradeModifier,
  ) {
    monster.setData("poolKey", this.getMonsterPoolKey(monsterData));
    monster.setData("isBoss", false);
    monster.setData("knockbackUntil", 0);
    monster.setScale(1, 1);
    monster.setAlpha(1);
    monster.setRotation(0);

    if (monster instanceof Phaser.GameObjects.Rectangle) {
      monster.setSize(MONSTER_WIDTH * gradeModifier.scale, MONSTER_HEIGHT * gradeModifier.scale);
      monster.setFillStyle(gradeModifier.color, 1);
      const rectangleBody = monster.body as Phaser.Physics.Arcade.Body;
      rectangleBody.setSize(MONSTER_WIDTH * gradeModifier.scale, MONSTER_HEIGHT * gradeModifier.scale);
      return;
    }

    if (monsterData.textureKey) {
      monster.setTexture(monsterData.textureKey);
    }
    monster.clearTint();
    monster.setDisplaySize(MONSTER_WIDTH * gradeModifier.scale, MONSTER_HEIGHT * gradeModifier.scale);
    if (gradeModifier.namePrefix) {
      monster.setTint(gradeModifier.color);
    }
    monster.setDepth(10);
    const spriteBody = monster.body as Phaser.Physics.Arcade.Body;
    spriteBody.setSize(MONSTER_WIDTH, MONSTER_HEIGHT);
  }

  /**
   * @date 2026-04-29
   * @desc 몬스터 풀 객체의 활성화와 반환 시 상태 초기화 규칙을 생성한다.
   */
  private createMonsterPoolLifecycle(): Poolable<MonsterGameObject> {
    return {
      init: (monster) => {
        const body = monster.body as Phaser.Physics.Arcade.Body;
        body.enable = true;
      },
      reset: (monster) => {
        monster.setData("hp", 0);
        monster.setData("maxHp", 0);
        monster.setData("damage", 0);
        monster.setData("moveSpeed", 0);
        monster.setData("expReward", 0);
        monster.setData("grade", "normal");
        monster.setData("isBoss", false);
        monster.setData("knockbackUntil", 0);
        monster.setAlpha(1);
        monster.setScale(1, 1);
        monster.setRotation(0);
      },
    };
  }

  /**
   * @date 2026-04-29
   * @desc 스테이지 진행도에 따라 몬스터 풀 초기 크기를 계산한다.
   */
  private computeMonsterPoolInitialSize(survivalElapsedMs: number) {
    if (survivalElapsedMs >= WAVE_ELITE_START_MS) {
      return MONSTER_POOL_LATE_SIZE;
    }

    if (survivalElapsedMs >= WAVE_LOW_DENSITY_END_MS) {
      return MONSTER_POOL_MID_SIZE;
    }

    return MONSTER_POOL_BASE_SIZE;
  }

  /**
   * @date 2026-04-28
   * @desc 생존 시간에 맞는 웨이브 스폰 간격과 수량을 반환한다.
   */
  getWaveConfig(survivalElapsedMs: number): WaveConfig {
    return getWaveConfigByElapsedMs(survivalElapsedMs);
  }

  /**
   * @date 2026-04-28
   * @desc 생존 시간 기준으로 일반/강화/엘리트 스폰 등급을 결정한다.
   */
  private pickMonsterGrade(survivalElapsedMs: number): MonsterGrade {
    const randomValue = Math.random();

    if (survivalElapsedMs >= WAVE_EXTREME_START_MS) {
      if (randomValue < 0.18) {
        return "elite";
      }
      return randomValue < 0.75 ? "enhanced" : "normal";
    }

    if (survivalElapsedMs >= WAVE_ELITE_START_MS) {
      if (randomValue < 0.1) {
        return "elite";
      }
      return randomValue < 0.55 ? "enhanced" : "normal";
    }

    if (survivalElapsedMs >= WAVE_ENHANCED_START_MS) {
      return randomValue < 0.45 ? "enhanced" : "normal";
    }

    return "normal";
  }

  /**
   * @date 2026-04-27
   * @desc 플레이어 주변 거리 범위와 월드 경계를 반영해 스폰 좌표를 계산한다.
   */
  private computeSpawnPosition(playerX: number, playerY: number) {
    const distance = Phaser.Math.Between(
      MONSTER_SPAWN_MIN_DISTANCE_FROM_PLAYER,
      MONSTER_SPAWN_MAX_DISTANCE_FROM_PLAYER,
    );
    const angleRadian = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const rawX = playerX + Math.cos(angleRadian) * distance;
    const rawY = playerY + Math.sin(angleRadian) * distance;

    return {
      x: Phaser.Math.Clamp(rawX, MONSTER_WIDTH / 2, WORLD_WIDTH - MONSTER_WIDTH / 2),
      y: Phaser.Math.Clamp(rawY, MONSTER_HEIGHT / 2, WORLD_HEIGHT - MONSTER_HEIGHT / 2),
    };
  }

  /**
   * @date 2026-04-27
   * @desc 몬스터 경험치 계수를 기준으로 처치 보상을 계산한다.
   */
  private computeMonsterExpReward(expCoefficient: number, gradeExpMultiplier: number) {
    return Math.max(1, Math.round(BASE_EXP_REWARD * expCoefficient * gradeExpMultiplier));
  }
}
