import Phaser from "phaser";
import monsters from "../data/monsters.json";
import {
  BASE_EXP_REWARD,
  WAVE_ELITE_START_MS,
  WAVE_ENHANCED_START_MS,
  WAVE_EXTREME_START_MS,
  MONSTER_HEIGHT,
  MONSTER_SPAWN_MAX_DISTANCE_FROM_PLAYER,
  MONSTER_SPAWN_MIN_DISTANCE_FROM_PLAYER,
  MONSTER_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../constants/gameConstants";
import type { MonsterGrade } from "../shared/gameTypes";
import { getWaveConfigByElapsedMs, type WaveConfig } from "./WaveSystem";

type MonsterData = {
  name: string;
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
   * @date 2026-04-27
   * @desc 플레이어 주변 월드 좌표에 몬스터를 스폰한다.
   */
  spawnMonster(
    scene: Phaser.Scene,
    playerX: number,
    playerY: number,
    survivalElapsedMs: number,
    forcedGrade?: MonsterGrade,
  ) {
    const pickedMonster = monsters[Math.floor(Math.random() * monsters.length)] as MonsterData;
    const monsterGrade = forcedGrade ?? this.pickMonsterGrade(survivalElapsedMs);
    const gradeModifier = MONSTER_GRADE_MODIFIERS[monsterGrade];
    const spawnPosition = this.computeSpawnPosition(playerX, playerY);
    const monster = scene.add.rectangle(
      spawnPosition.x,
      spawnPosition.y,
      MONSTER_WIDTH * gradeModifier.scale,
      MONSTER_HEIGHT * gradeModifier.scale,
      gradeModifier.color,
    );
    scene.physics.add.existing(monster);

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
