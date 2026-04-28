import {
  ATTACK_COUNT_STACKS_PER_BONUS,
  PLAYER_BASE_AREA_MULTIPLIER,
  PLAYER_BASE_ATTACK_COUNT,
  PLAYER_BASE_COOLDOWN_MULTIPLIER,
  PLAYER_BASE_CRITICAL_CHANCE,
  PLAYER_BASE_CRITICAL_DAMAGE_MULTIPLIER,
  PLAYER_BASE_EXP_MULTIPLIER,
  PLAYER_SPEED,
  STAT_ATTACK_RANGE_PRIMARY_STEP,
  STAT_ATTACK_RANGE_SOFT_STEP,
  STAT_ATTACK_SPEED_PRIMARY_STEP,
  STAT_ATTACK_SPEED_SOFT_STEP,
  STAT_CRITICAL_CHANCE_PRIMARY_STEP,
  STAT_CRITICAL_CHANCE_SOFT_STEP,
  STAT_CRITICAL_DAMAGE_PRIMARY_STEP,
  STAT_CRITICAL_DAMAGE_SOFT_STEP,
  STAT_DAMAGE_PRIMARY_STEP,
  STAT_DAMAGE_SOFT_STEP,
  STAT_EXP_GAIN_PRIMARY_STEP,
  STAT_EXP_GAIN_SOFT_STEP,
  STAT_MOVE_SPEED_PRIMARY_STEP,
  STAT_MOVE_SPEED_SOFT_STEP,
  STAT_SOFT_CAP_STACK,
} from "../constants/gameConstants";
import statUpgradeOptions from "../data/statUpgrades.json";
import type { LevelUpOption, PlayerState } from "../shared/gameTypes";

/**
 * @date 2026-04-27
 * @desc 레벨업과 경험치 규칙 및 스탯 선택지를 관리한다.
 */
export class ProgressionSystem {
  private readonly randomProvider: () => number;

  /**
   * @date 2026-04-27
   * @desc 랜덤 소스를 주입받아 선택지 추첨을 테스트 가능하게 구성한다.
   */
  constructor(randomProvider: () => number = Math.random) {
    this.randomProvider = randomProvider;
  }

  /**
   * @date 2026-04-27
   * @desc 현재 레벨에서 다음 레벨까지 필요한 경험치를 계산한다.
   */
  getRequiredExp(playerState: PlayerState) {
    return playerState.level * 10;
  }

  /**
   * @date 2026-04-27
   * @desc 플레이어 상태에 경험치를 누적한다.
   */
  grantExp(playerState: PlayerState, amount: number) {
    playerState.exp += amount;
  }

  /**
   * @date 2026-04-27
   * @desc 현재 경험치가 레벨업 요구치를 충족하는지 판단한다.
   */
  canLevelUp(playerState: PlayerState) {
    const requiredExp = this.getRequiredExp(playerState);
    return playerState.exp >= requiredExp;
  }

  /**
   * @date 2026-04-27
   * @desc 레벨업 보상을 적용하고 요구 경험치를 차감한다.
   */
  applyLevelUp(playerState: PlayerState, selectedOption?: LevelUpOption) {
    const requiredExp = this.getRequiredExp(playerState);
    playerState.exp = Math.max(0, playerState.exp - requiredExp);
    playerState.level += 1;

    if (!selectedOption) {
      return;
    }

    playerState.statStacks[selectedOption.targetId] += 1;
    this.recalculateStackedStats(playerState);
  }

  /**
   * @date 2026-04-27
   * @desc 스탯 레벨업 선택지를 무작위 셔플 후 최대 3개 반환한다.
   */
  pickLevelUpOptions(playerState?: PlayerState) {
    const copied = (statUpgradeOptions as LevelUpOption[]).map((option) => {
      return {
        ...option,
        currentStack: playerState?.statStacks[option.targetId] ?? 0,
      };
    });
    this.shuffleOptions(copied);
    return copied.slice(0, 3);
  }

  /**
   * @date 2026-04-28
   * @desc 스택 누적값을 기반으로 전투 파생 스탯을 재계산한다.
   */
  recalculateStackedStats(playerState: PlayerState) {
    playerState.cooldownMultiplier = Math.max(
      0.2,
      PLAYER_BASE_COOLDOWN_MULTIPLIER +
        this.computeStackBonus(
          playerState.statStacks.attackSpeed,
          STAT_ATTACK_SPEED_PRIMARY_STEP,
          STAT_ATTACK_SPEED_SOFT_STEP,
        ),
    );
    playerState.expMultiplier =
      PLAYER_BASE_EXP_MULTIPLIER +
      this.computeStackBonus(
        playerState.statStacks.expGain,
        STAT_EXP_GAIN_PRIMARY_STEP,
        STAT_EXP_GAIN_SOFT_STEP,
      );
    playerState.damage = Math.max(
      1,
      Math.round(
        playerState.baseDamage *
          (1 +
            this.computeStackBonus(
              playerState.statStacks.damage,
              STAT_DAMAGE_PRIMARY_STEP,
              STAT_DAMAGE_SOFT_STEP,
            )),
      ),
    );
    playerState.criticalChance = Math.min(
      0.95,
      PLAYER_BASE_CRITICAL_CHANCE +
        this.computeStackBonus(
          playerState.statStacks.criticalChance,
          STAT_CRITICAL_CHANCE_PRIMARY_STEP,
          STAT_CRITICAL_CHANCE_SOFT_STEP,
        ),
    );
    playerState.criticalDamageMultiplier =
      PLAYER_BASE_CRITICAL_DAMAGE_MULTIPLIER +
      this.computeStackBonus(
        playerState.statStacks.criticalDamage,
        STAT_CRITICAL_DAMAGE_PRIMARY_STEP,
        STAT_CRITICAL_DAMAGE_SOFT_STEP,
      );
    playerState.moveSpeed = Math.round(
      PLAYER_SPEED *
        (1 +
          this.computeStackBonus(
            playerState.statStacks.moveSpeed,
            STAT_MOVE_SPEED_PRIMARY_STEP,
            STAT_MOVE_SPEED_SOFT_STEP,
          )),
    );
    playerState.areaMultiplier =
      PLAYER_BASE_AREA_MULTIPLIER +
      this.computeStackBonus(
        playerState.statStacks.attackRange,
        STAT_ATTACK_RANGE_PRIMARY_STEP,
        STAT_ATTACK_RANGE_SOFT_STEP,
      );
    playerState.attackRange = Math.round(playerState.baseAttackRange * playerState.areaMultiplier);
    playerState.attackCount =
      PLAYER_BASE_ATTACK_COUNT +
      Math.floor(playerState.statStacks.attackCount / ATTACK_COUNT_STACKS_PER_BONUS);
  }

  /**
   * @date 2026-04-28
   * @desc 30스택 이후 소프트캡을 적용해 누적 보너스를 계산한다.
   */
  private computeStackBonus(stackCount: number, primaryStep: number, softStep: number) {
    const primaryStacks = Math.min(stackCount, STAT_SOFT_CAP_STACK);
    const softStacks = Math.max(0, stackCount - STAT_SOFT_CAP_STACK);
    return primaryStacks * primaryStep + softStacks * softStep;
  }

  /**
   * @date 2026-04-27
   * @desc Fisher-Yates 셔플로 선택지 배열 순서를 무작위로 변경한다.
   */
  private shuffleOptions(options: LevelUpOption[]) {
    for (let index = options.length - 1; index > 0; index -= 1) {
      const targetIndex = Math.floor(this.randomProvider() * (index + 1));
      const currentValue = options[index];
      options[index] = options[targetIndex];
      options[targetIndex] = currentValue;
    }
  }
}
