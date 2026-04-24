import Phaser from "phaser";
import {
  BOSS_APPEAR_INTERVAL_MS,
  GAME_HEIGHT,
  GAME_WIDTH,
  MONSTER_SPEED,
  PLAYER_SPEED,
} from "../constants/gameConstants";
import { eventBus } from "../core/eventBus";
import { CombatSystem } from "../systems/CombatSystem";
import { ProgressionSystem } from "../systems/ProgressionSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { SynergySystem } from "../systems/SynergySystem";
import type { PlayerState } from "../shared/gameTypes";

type StageSceneInitData = {
  playerState?: PlayerState;
  selectedOptions?: string[];
  survivalElapsedMs?: number;
  nextBossTriggerElapsedMs?: number;
  bossPhase?: number;
};

type MoveKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
};

/**
 * @date 2026-04-24
 * @desc 일반 스테이지 생존 루프를 처리하고 구간마다 보스전을 호출한다.
 */
export class StageScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private head!: Phaser.GameObjects.Arc;
  private timerText!: Phaser.GameObjects.Text;
  private expBarBackground!: Phaser.GameObjects.Rectangle;
  private expBarFill!: Phaser.GameObjects.Rectangle;
  private expBarText!: Phaser.GameObjects.Text;
  private moveKeys!: MoveKeys;
  private lookKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private monsters: Phaser.GameObjects.Rectangle[] = [];
  private nextSpawnTimestamp = 0;
  private nextPlayerHitTimestamp = 0;
  private attackCooldownTimestamp = 0;
  private isLevelUpOpen = false;
  private survivalStartTimestamp = 0;
  private survivalElapsedOffsetMs = 0;
  private nextBossTriggerElapsedMs = BOSS_APPEAR_INTERVAL_MS;
  private bossPhase = 1;
  private initData: StageSceneInitData | undefined;
  private lastDirectionLabel = "Right";
  private readonly lookDirection = new Phaser.Math.Vector2(1, 0);
  private readonly targetLookDirection = new Phaser.Math.Vector2(1, 0);
  private readonly combatSystem = new CombatSystem();
  private readonly progressionSystem = new ProgressionSystem();
  private readonly spawnSystem = new SpawnSystem();
  private readonly synergySystem = new SynergySystem();
  private readonly playerState: PlayerState = {
    level: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    damage: 10,
  };
  private readonly selectedOptions: string[] = [];
  private readonly handleLevelUpSelected = (payload: { optionName: string }) => {
    this.applyLevelUpSelection(payload.optionName);
  };

  constructor() {
    super("StageScene");
  }

  /**
   * @date 2026-04-24
   * @desc 보스전 이후 복귀 상태 또는 신규 시작 상태를 전달받는다.
   */
  init(data: StageSceneInitData) {
    this.initData = data;
  }

  /**
   * @date 2026-04-24
   * @desc 스테이지 오브젝트와 타이머, 입력 상태를 초기화한다.
   */
  create() {
    eventBus.emit("scene:changed", "Stage");
    eventBus.emit("combat:target-updated", null);

    this.nextSpawnTimestamp = this.time.now + 1_200;
    this.nextPlayerHitTimestamp = this.time.now;
    this.attackCooldownTimestamp = this.time.now;
    this.survivalStartTimestamp = this.time.now;
    this.isLevelUpOpen = false;
    this.monsters = [];

    this.applyInitData();

    this.player = this.add.rectangle(180, 280, 46, 56, 0x3b82f6);
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);

    this.head = this.add.circle(this.player.x + 18, this.player.y, 8, 0xffffff);

    this.moveKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as MoveKeys;
    this.lookKeys = this.input.keyboard!.createCursorKeys();
    this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.timerText = this.add
      .text(480, 24, "", {
        fontSize: "24px",
        color: "#f8fafc",
      })
      .setOrigin(0.5, 0);
    this.createExpBar();
    this.updateTimerText();
    this.updateExpBar();
    this.emitDirectionIfChanged(true);
    this.updateHeadVisual();

    eventBus.on("levelup:selected", this.handleLevelUpSelected);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBus.off("levelup:selected", this.handleLevelUpSelected);
      eventBus.emit("combat:target-updated", null);
    });
  }

  /**
   * @date 2026-04-24
   * @desc 프레임마다 생존 시간, 이동, 전투, 보스 트리거를 갱신한다.
   */
  update() {
    this.updateTimerText();
    this.updateExpBar();
    this.updateLookDirectionTarget();
    this.updateSmoothLookDirection();
    this.emitDirectionIfChanged(false);
    this.updateHeadVisual();

    if (this.isLevelUpOpen) {
      return;
    }

    this.updatePlayerMovement();
    this.updateMonsterMovement();
    this.handleAttack();
    this.spawnMonstersIfNeeded();
    this.handlePlayerCollisionDamage();
    this.handleExpBasedLevelUp();
    this.handleBossTrigger();
  }

  /**
   * @date 2026-04-24
   * @desc 전달받은 초기화 데이터를 현재 스테이지 상태에 반영한다.
   */
  private applyInitData() {
    if (!this.initData || !this.initData.playerState) {
      this.playerState.level = 1;
      this.playerState.exp = 0;
      this.playerState.maxHp = 100;
      this.playerState.hp = this.playerState.maxHp;
      this.playerState.damage = 10;
      this.selectedOptions.length = 0;
      this.survivalElapsedOffsetMs = 0;
      this.nextBossTriggerElapsedMs = BOSS_APPEAR_INTERVAL_MS;
      this.bossPhase = 1;
      this.lookDirection.set(1, 0);
      this.targetLookDirection.set(1, 0);
      this.lastDirectionLabel = "Right";
      return;
    }

    this.playerState.level = this.initData.playerState.level;
    this.playerState.exp = this.initData.playerState.exp;
    this.playerState.maxHp = this.initData.playerState.maxHp;
    this.playerState.hp = this.initData.playerState.hp;
    this.playerState.damage = this.initData.playerState.damage;
    this.selectedOptions.length = 0;
    (this.initData.selectedOptions ?? []).forEach((optionName) => {
      this.selectedOptions.push(optionName);
    });
    this.survivalElapsedOffsetMs = this.initData.survivalElapsedMs ?? 0;
    this.nextBossTriggerElapsedMs =
      this.initData.nextBossTriggerElapsedMs ?? BOSS_APPEAR_INTERVAL_MS;
    this.bossPhase = this.initData.bossPhase ?? 1;
    this.lookDirection.set(1, 0);
    this.targetLookDirection.set(1, 0);
    this.lastDirectionLabel = "Right";
  }

  /**
   * @date 2026-04-24
   * @desc WASD 입력으로 플레이어 이동 속도를 갱신한다.
   */
  private updatePlayerMovement() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setVelocity(0, 0);

    if (this.moveKeys.left.isDown) {
      playerBody.setVelocityX(-PLAYER_SPEED);
    } else if (this.moveKeys.right.isDown) {
      playerBody.setVelocityX(PLAYER_SPEED);
    }

    if (this.moveKeys.up.isDown) {
      playerBody.setVelocityY(-PLAYER_SPEED);
    } else if (this.moveKeys.down.isDown) {
      playerBody.setVelocityY(PLAYER_SPEED);
    }
  }

  /**
   * @date 2026-04-24
   * @desc 마우스 포인터를 우선으로 목표 시선 방향을 설정하고, 범위 밖에서는 화살표 입력을 사용한다.
   */
  private updateLookDirectionTarget() {
    const activePointer = this.input.activePointer;
    const isPointerInGameArea =
      activePointer.x >= 0 &&
      activePointer.x <= GAME_WIDTH &&
      activePointer.y >= 0 &&
      activePointer.y <= GAME_HEIGHT;
    if (isPointerInGameArea) {
      const pointerDeltaX = activePointer.x - this.player.x;
      const pointerDeltaY = activePointer.y - this.player.y;
      const pointerDistance = Math.hypot(pointerDeltaX, pointerDeltaY);
      if (pointerDistance > 4) {
        this.targetLookDirection.set(
          pointerDeltaX / pointerDistance,
          pointerDeltaY / pointerDistance,
        );
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.lookKeys.left)) {
      this.targetLookDirection.set(-1, 0);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.lookKeys.right)) {
      this.targetLookDirection.set(1, 0);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.lookKeys.up)) {
      this.targetLookDirection.set(0, -1);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.lookKeys.down)) {
      this.targetLookDirection.set(0, 1);
    }
  }

  /**
   * @date 2026-04-24
   * @desc 현재 시선 방향을 목표 시선 방향으로 부드럽게 보간한다.
   */
  private updateSmoothLookDirection() {
    const smoothingFactor = 0.18;
    this.lookDirection.x = Phaser.Math.Linear(
      this.lookDirection.x,
      this.targetLookDirection.x,
      smoothingFactor,
    );
    this.lookDirection.y = Phaser.Math.Linear(
      this.lookDirection.y,
      this.targetLookDirection.y,
      smoothingFactor,
    );
    const directionLength = this.lookDirection.length();
    if (directionLength < 0.0001) {
      this.lookDirection.set(this.targetLookDirection.x, this.targetLookDirection.y);
    } else {
      this.lookDirection.scale(1 / directionLength);
    }
  }

  /**
   * @date 2026-04-24
   * @desc 시선 벡터를 기준으로 머리 위치를 부드럽게 갱신한다.
   */
  private updateHeadVisual() {
    const targetHeadX = this.player.x + this.lookDirection.x * 18;
    const targetHeadY = this.player.y + this.lookDirection.y * 18;
    this.head.x = Phaser.Math.Linear(this.head.x, targetHeadX, 0.35);
    this.head.y = Phaser.Math.Linear(this.head.y, targetHeadY, 0.35);
  }

  /**
   * @date 2026-04-24
   * @desc 현재 시선 라벨을 헤더에 발행한다.
   */
  private emitDirectionIfChanged(forceEmit: boolean) {
    const nextDirectionLabel = this.getDirectionLabel();
    if (!forceEmit && nextDirectionLabel === this.lastDirectionLabel) {
      return;
    }

    this.lastDirectionLabel = nextDirectionLabel;
    eventBus.emit("player:direction-updated", { label: nextDirectionLabel });
  }

  /**
   * @date 2026-04-24
   * @desc 현재 시선 벡터를 텍스트 방향 값으로 변환한다.
   */
  private getDirectionLabel() {
    const absoluteX = Math.abs(this.lookDirection.x);
    const absoluteY = Math.abs(this.lookDirection.y);

    if (absoluteX >= absoluteY) {
      return this.lookDirection.x >= 0 ? "Right" : "Left";
    }

    return this.lookDirection.y >= 0 ? "Down" : "Up";
  }

  /**
   * @date 2026-04-24
   * @desc 몬스터를 플레이어 위치로 추적 이동시킨다.
   */
  private updateMonsterMovement() {
    this.monsters.forEach((monster) => {
      const monsterBody = monster.body as Phaser.Physics.Arcade.Body;
      const deltaX = this.player.x - monster.x;
      const deltaY = this.player.y - monster.y;
      const length = Math.hypot(deltaX, deltaY) || 1;
      const moveSpeed = Number(monster.getData("moveSpeed") ?? MONSTER_SPEED);

      monsterBody.setVelocity((deltaX / length) * moveSpeed, (deltaY / length) * moveSpeed);
    });
  }

  /**
   * @date 2026-04-24
   * @desc 공격 입력 시 시선 방향 전방 몬스터에게 피해를 적용한다.
   */
  private handleAttack() {
    if (!Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      return;
    }

    if (this.time.now < this.attackCooldownTimestamp) {
      return;
    }

    this.attackCooldownTimestamp = this.time.now + 300;
    this.playAttackEffect();

    const attackRange = 90;
    const targetMonster = this.findAttackTarget(attackRange);
    if (!targetMonster) {
      return;
    }

    const currentHp = Number(targetMonster.getData("hp") ?? 0);
    const maxHp = Number(targetMonster.getData("maxHp") ?? currentHp);
    const targetName = String(targetMonster.getData("name") ?? "Monster");
    const synergy = this.synergySystem.evaluate(this.selectedOptions);
    const nextHp = this.combatSystem.applyDamage(
      currentHp,
      this.playerState.damage + synergy.bonusDamage,
    );
    targetMonster.setData("hp", nextHp);
    eventBus.emit("combat:target-updated", {
      name: targetName,
      hp: nextHp,
      maxHp,
    });

    if (nextHp <= 0) {
      const expReward = Number(targetMonster.getData("expReward") ?? 1);
      this.progressionSystem.grantExp(this.playerState, expReward);
      targetMonster.destroy();
      this.monsters = this.monsters.filter((monster) => monster.active);
    }
  }

  /**
   * @date 2026-04-24
   * @desc 시선 방향 앞쪽에 있는 공격 대상을 탐색한다.
   */
  private findAttackTarget(attackRange: number) {
    const attackCandidates = this.monsters
      .map((monster) => {
        const deltaX = monster.x - this.player.x;
        const deltaY = monster.y - this.player.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > attackRange) {
          return null;
        }

        const directionX = deltaX / Math.max(distance, 0.0001);
        const directionY = deltaY / Math.max(distance, 0.0001);
        const directionDot = directionX * this.lookDirection.x + directionY * this.lookDirection.y;
        if (directionDot < 0.35) {
          return null;
        }

        return {
          monster,
          distance,
          directionDot,
        };
      })
      .filter((candidate): candidate is { monster: Phaser.GameObjects.Rectangle; distance: number; directionDot: number } => {
        return candidate !== null;
      });

    attackCandidates.sort((leftCandidate, rightCandidate) => {
      if (leftCandidate.distance !== rightCandidate.distance) {
        return leftCandidate.distance - rightCandidate.distance;
      }

      return rightCandidate.directionDot - leftCandidate.directionDot;
    });

    return attackCandidates[0]?.monster;
  }

  /**
   * @date 2026-04-24
   * @desc 주기적으로 몬스터를 생성한다.
   */
  private spawnMonstersIfNeeded() {
    if (this.time.now < this.nextSpawnTimestamp) {
      return;
    }

    this.nextSpawnTimestamp = this.time.now + 1_400;
    const monster = this.spawnSystem.spawnMonster(this);
    this.monsters.push(monster);
  }

  /**
   * @date 2026-04-24
   * @desc 플레이어와 몬스터 접촉 시 주기 피해를 적용하고 사망 시 결과 씬으로 전환한다.
   */
  private handlePlayerCollisionDamage() {
    if (this.time.now < this.nextPlayerHitTimestamp) {
      return;
    }

    const isColliding = this.monsters.some((monster) => {
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, monster.x, monster.y) <= 36;
    });

    if (!isColliding) {
      return;
    }

    this.nextPlayerHitTimestamp = this.time.now + 900;
    this.playerState.hp = this.combatSystem.applyDamage(this.playerState.hp, 6);

    if (this.combatSystem.isDead(this.playerState.hp)) {
      eventBus.emit("combat:target-updated", null);
      this.scene.start("ResultScene", { result: "dead" });
    }
  }

  /**
   * @date 2026-04-24
   * @desc 경험치가 레벨업 기준에 도달했을 때 선택지를 표시한다.
   */
  private handleExpBasedLevelUp() {
    const canLevelUp = this.progressionSystem.canLevelUp(this.playerState);
    if (!canLevelUp) {
      return;
    }

    this.showLevelUpOptions();
  }

  /**
   * @date 2026-04-24
   * @desc 레벨업 선택지를 EventBus로 전달하고 일시정지 상태를 활성화한다.
   */
  private showLevelUpOptions() {
    this.isLevelUpOpen = true;
    this.physics.world.pause();
    const options = this.progressionSystem.pickLevelUpOptions();
    eventBus.emit("levelup:shown", { options });
  }

  /**
   * @date 2026-04-24
   * @desc 선택된 레벨업 옵션을 저장하고 능력치를 갱신한다.
   */
  private applyLevelUpSelection(optionName: string) {
    if (!this.isLevelUpOpen) {
      return;
    }

    this.selectedOptions.push(optionName);
    this.progressionSystem.applyLevelUp(this.playerState);
    this.isLevelUpOpen = false;
    this.physics.world.resume();
    eventBus.emit("levelup:closed", undefined);
  }

  /**
   * @date 2026-04-24
   * @desc 생존 누적 시간이 보스 구간에 도달하면 보스 씬으로 전환한다.
   */
  private handleBossTrigger() {
    if (this.getSurvivalElapsedMs() < this.nextBossTriggerElapsedMs) {
      return;
    }

    eventBus.emit("combat:target-updated", null);
    this.scene.start("BossScene", {
      playerState: { ...this.playerState },
      selectedOptions: [...this.selectedOptions],
      survivalElapsedMs: this.getSurvivalElapsedMs(),
      nextBossTriggerElapsedMs: this.nextBossTriggerElapsedMs + BOSS_APPEAR_INTERVAL_MS,
      bossPhase: this.bossPhase,
    });
  }

  /**
   * @date 2026-04-24
   * @desc 현재 런의 누적 생존 시간을 밀리초 단위로 계산한다.
   */
  private getSurvivalElapsedMs() {
    return this.survivalElapsedOffsetMs + (this.time.now - this.survivalStartTimestamp);
  }

  /**
   * @date 2026-04-24
   * @desc 누적 생존 시간을 화면 상단 중앙 텍스트로 표시한다.
   */
  private updateTimerText() {
    const survivalSecond = Math.floor(this.getSurvivalElapsedMs() / 1000);
    this.timerText.setText(`생존 시간 ${survivalSecond}s`);
  }

  /**
   * @date 2026-04-24
   * @desc 화면 하단에 경험치 바와 수치 텍스트를 생성한다.
   */
  private createExpBar() {
    const expBarWidth = GAME_WIDTH - 96;
    const expBarX = 48;
    const expBarY = GAME_HEIGHT - 22;

    this.expBarBackground = this.add.rectangle(expBarX, expBarY, expBarWidth, 14, 0x0f172a);
    this.expBarBackground.setOrigin(0, 0.5);
    this.expBarBackground.setStrokeStyle(1, 0x334155);

    this.expBarFill = this.add.rectangle(expBarX, expBarY, expBarWidth, 14, 0x22d3ee);
    this.expBarFill.setOrigin(0, 0.5);

    this.expBarText = this.add
      .text(GAME_WIDTH / 2, expBarY - 14, "", {
        fontSize: "16px",
        color: "#e2e8f0",
      })
      .setOrigin(0.5, 1);
  }

  /**
   * @date 2026-04-24
   * @desc 현재 경험치와 필요 경험치 기준으로 하단 경험치 바를 갱신한다.
   */
  private updateExpBar() {
    const requiredExp = this.progressionSystem.getRequiredExp(this.playerState);
    const currentExp = Math.max(0, Math.min(requiredExp, this.playerState.exp));
    const progressRatio = requiredExp <= 0 ? 0 : currentExp / requiredExp;
    const expBarWidth = GAME_WIDTH - 96;

    this.expBarFill.displayWidth = Math.max(0, expBarWidth * progressRatio);
    this.expBarText.setText(`EXP ${this.playerState.exp} / ${requiredExp}  (Lv.${this.playerState.level})`);
  }

  /**
   * @date 2026-04-24
   * @desc 기본 공격 시 시선 방향 앞쪽에 타격 이펙트를 표시한다.
   */
  private playAttackEffect() {
    const effectX = this.player.x + this.lookDirection.x * 46;
    const effectY = this.player.y + this.lookDirection.y * 46;
    const effectRotation = Math.atan2(this.lookDirection.y, this.lookDirection.x);
    const effect = this.add.rectangle(effectX, effectY, 52, 18, 0xfacc15);
    effect.setAlpha(0.9);
    effect.setRotation(effectRotation);

    this.tweens.add({
      targets: effect,
      alpha: 0,
      scaleX: 1.35,
      scaleY: 0.6,
      duration: 120,
      onComplete: () => {
        effect.destroy();
      },
    });
  }
}
