import Phaser from "phaser";
import {
  BASE_EXP_REWARD,
  BOSS_DURATION_MS,
  BOSS_PHASE_EXP_GROWTH_RATE,
} from "../constants/gameConstants";
import bosses from "../data/bosses.json";
import { eventBus } from "../core/eventBus";
import { CombatSystem } from "../systems/CombatSystem";
import type { PlayerState } from "../shared/gameTypes";

type BossSceneInitData = {
  playerState: PlayerState;
  selectedOptions: string[];
  survivalElapsedMs: number;
  nextBossTriggerElapsedMs: number;
  bossPhase: number;
};

/**
 * @date 2026-04-24
 * @desc 보스전 단일 페이즈를 처리하고 결과에 따라 다음 씬으로 전환한다.
 */
export class BossScene extends Phaser.Scene {
  private bossExpCoefficient = Number(bosses[0]?.expCoefficient ?? 12);
  private bossName = String(bosses[0]?.name ?? "Boss");
  private bossMaxHp = Number(bosses[0]?.maxHp ?? 250);
  private bossHp = this.bossMaxHp;
  private playerState: PlayerState = {
    level: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    damage: 10,
  };
  private selectedOptions: string[] = [];
  private survivalElapsedMs = 0;
  private nextBossTriggerElapsedMs = 30_000;
  private bossPhase = 1;
  private endTimestamp = 0;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private bossSprite!: Phaser.GameObjects.Rectangle;
  private readonly combatSystem = new CombatSystem();
  private bossText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;

  constructor() {
    super("BossScene");
  }

  /**
   * @date 2026-04-24
   * @desc 스테이지에서 전달한 전투 상태를 보스전 데이터로 반영한다.
   */
  init(data: BossSceneInitData) {
    this.playerState = { ...data.playerState };
    this.selectedOptions = [...data.selectedOptions];
    this.survivalElapsedMs = data.survivalElapsedMs;
    this.nextBossTriggerElapsedMs = data.nextBossTriggerElapsedMs;
    this.bossPhase = data.bossPhase;
    this.bossName = String(bosses[0]?.name ?? "Boss");
    this.bossExpCoefficient = Number(bosses[0]?.expCoefficient ?? 12);
    this.bossMaxHp = this.computeBossMaxHp(this.bossPhase);
    this.bossHp = this.bossMaxHp;
  }

  /**
   * @date 2026-04-24
   * @desc 보스전 UI와 입력을 구성한다.
   */
  create() {
    eventBus.emit("scene:changed", "Boss");
    eventBus.emit("combat:target-updated", null);

    this.endTimestamp = this.time.now + BOSS_DURATION_MS;
    this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.add.text(220, 120, `Boss ${this.bossPhase}: ${this.bossName}`, {
      fontSize: "40px",
      color: "#f8fafc",
    });
    this.bossSprite = this.add.rectangle(490, 280, 120, 120, 0x991b1b);
    this.bossText = this.add.text(220, 360, "", { fontSize: "28px", color: "#fca5a5" });
    this.infoText = this.add.text(220, 410, "SPACE를 눌러 공격", {
      fontSize: "22px",
      color: "#cbd5e1",
    });
    this.updateBossText();
  }

  /**
   * @date 2026-04-24
   * @desc 공격 입력과 제한 시간 종료를 감시한다.
   */
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.playAttackEffect();
      this.bossHp = this.combatSystem.applyDamage(this.bossHp, this.playerState.damage);
      eventBus.emit("combat:target-updated", {
        name: this.bossName,
        hp: this.bossHp,
        maxHp: this.bossMaxHp,
      });
      this.updateBossText();
    }

    if (this.bossHp <= 0) {
      const bossExpReward = this.computeBossExpReward(this.bossPhase);
      this.playerState.exp += bossExpReward;
      eventBus.emit("combat:target-updated", null);
      this.scene.start("StageScene", {
        playerState: { ...this.playerState },
        selectedOptions: [...this.selectedOptions],
        survivalElapsedMs: this.survivalElapsedMs,
        nextBossTriggerElapsedMs: this.nextBossTriggerElapsedMs,
        bossPhase: this.bossPhase + 1,
      });
      return;
    }

    if (this.time.now >= this.endTimestamp) {
      eventBus.emit("combat:target-updated", null);
      this.scene.start("ResultScene", { result: "dead" });
    }
  }

  /**
   * @date 2026-04-24
   * @desc 현재 보스 체력 값을 텍스트로 갱신한다.
   */
  private updateBossText() {
    this.bossText.setText(`보스 체력: ${this.bossHp}/${this.bossMaxHp}`);
    if (this.bossHp < Math.floor(this.bossMaxHp * 0.25)) {
      this.infoText.setText("마무리 일격을 넣으세요!");
    }
  }

  /**
   * @date 2026-04-24
   * @desc 보스 페이즈에 따라 최대 체력을 계산한다.
   */
  private computeBossMaxHp(bossPhase: number) {
    const baseBossHp = Number(bosses[0]?.maxHp ?? 250);
    return baseBossHp + (bossPhase - 1) * 80;
  }

  /**
   * @date 2026-04-24
   * @desc 보스 계수와 페이즈 성장률을 반영하여 보스 처치 경험치를 계산한다.
   */
  private computeBossExpReward(bossPhase: number) {
    const phaseMultiplier = 1 + (bossPhase - 1) * BOSS_PHASE_EXP_GROWTH_RATE;
    return Math.max(1, Math.round(BASE_EXP_REWARD * this.bossExpCoefficient * phaseMultiplier));
  }

  /**
   * @date 2026-04-24
   * @desc 보스전에서 스페이스 공격 시 타격 이펙트를 재생한다.
   */
  private playAttackEffect() {
    const effect = this.add.rectangle(this.bossSprite.x - 90, this.bossSprite.y, 70, 20, 0xf59e0b);
    effect.setAlpha(0.95);
    effect.setRotation(Phaser.Math.DegToRad(-18));

    this.tweens.add({
      targets: effect,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 0.5,
      duration: 130,
      onComplete: () => {
        effect.destroy();
      },
    });
  }
}
