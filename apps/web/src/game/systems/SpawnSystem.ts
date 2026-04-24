import Phaser from "phaser";
import monsters from "../data/monsters.json";
import { BASE_EXP_REWARD } from "../constants/gameConstants";

type MonsterData = {
  name: string;
  maxHp: number;
  damage: number;
  moveSpeed: number;
  expCoefficient: number;
};

/**
 * @date 2026-04-23
 * @desc 스테이지 몬스터 스폰 위치와 초기 데이터를 생성한다.
 */
export class SpawnSystem {
  /**
   * @date 2026-04-23
   * @desc 화면 우측 기준 랜덤 위치에 몬스터를 배치한다.
   */
  spawnMonster(scene: Phaser.Scene) {
    const pickedMonster = monsters[Math.floor(Math.random() * monsters.length)] as MonsterData;
    const spawnX = 820 + Math.floor(Math.random() * 80);
    const spawnY = 180 + Math.floor(Math.random() * 220);
    const monster = scene.add.rectangle(spawnX, spawnY, 42, 42, 0xef4444);
    scene.physics.add.existing(monster);

    const body = monster.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    monster.setData("name", pickedMonster.name);
    monster.setData("hp", pickedMonster.maxHp);
    monster.setData("maxHp", pickedMonster.maxHp);
    monster.setData("damage", pickedMonster.damage);
    monster.setData("moveSpeed", pickedMonster.moveSpeed);
    monster.setData("expReward", this.computeMonsterExpReward(pickedMonster.expCoefficient));

    return monster;
  }

  /**
   * @date 2026-04-24
   * @desc 몬스터 경험치 계수를 기준으로 처치 보상을 계산한다.
   */
  private computeMonsterExpReward(expCoefficient: number) {
    return Math.max(1, Math.round(BASE_EXP_REWARD * expCoefficient));
  }
}
