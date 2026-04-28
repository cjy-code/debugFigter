import Phaser from "phaser";
import {
  BOSS_APPEAR_INTERVAL_MS,
  BOSS_DEFAULT_EXP_COEFFICIENT,
  BOSS_DEFAULT_MAX_HP,
  BOSS_PHASE_EXP_GROWTH_RATE,
  BOSS_PHASE_HP_INCREMENT,
  BOSS_REAPPEAR_INTERVAL_MS,
  BOSS_STAGE_CLEAR_RADIUS,
  BOSS_STAGE_COLOR,
  BOSS_STAGE_DEPTH,
  BOSS_STAGE_HEIGHT,
  BOSS_STAGE_PUSH_FORCE,
  BOSS_STAGE_SPAWN_DISTANCE,
  BOSS_STAGE_WIDTH,
  BOSS_WARNING_DURATION_MS,
  DEFAULT_PLAYER_CLASS_TYPE,
  FINAL_BOSS_PHASE,
  GAME_HEIGHT,
  GAME_WIDTH,
  INITIAL_MONSTER_SPAWN_DELAY_MS,
  LOOK_POINTER_MIN_DISTANCE,
  LOOK_DIRECTION_SMOOTHING_FACTOR,
  MONSTER_SPEED,
  MONSTER_KNOCKBACK_DURATION_MS,
  MONSTER_KNOCKBACK_FORCE,
  AUTO_SKILL_COOLDOWN_MS,
  BASE_EXP_REWARD,
  EXP_ORB_ABSORB_DISTANCE,
  EXP_ORB_COLOR,
  EXP_ORB_DEPTH,
  EXP_ORB_MAX_COUNT,
  EXP_ORB_MAX_MOVE_SPEED,
  EXP_ORB_MIN_MOVE_SPEED,
  EXP_ORB_MOVE_SPEED_FACTOR,
  EXP_ORB_RADIUS,
  EXP_ORB_SCATTER_RADIUS,
  EXP_ORB_STROKE_COLOR,
  EXP_ORB_STROKE_WIDTH,
  KARMA_BASIC_DROP_RATE,
  KARMA_BASIC_MAX_COUNT,
  KARMA_COLOR_BY_ID,
  KARMA_ORB_ABSORB_DISTANCE,
  KARMA_ORB_DEPTH,
  KARMA_ORB_MAX_MOVE_SPEED,
  KARMA_ORB_MIN_MOVE_SPEED,
  KARMA_ORB_MOVE_SPEED_FACTOR,
  KARMA_ORB_RADIUS,
  KARMA_ORB_SCATTER_RADIUS,
  KARMA_ORB_STROKE_COLOR,
  KARMA_ORB_STROKE_WIDTH,
  KARMA_TRANSFORM_SHARD_MAX_COUNT,
  ELITE_MONSTER_MAX_INTERVAL_MS,
  ELITE_MONSTER_MIN_INTERVAL_MS,
  ELITE_MONSTER_START_MS,
  PLAYER_ATTACK_EFFECT_ALPHA,
  PLAYER_ATTACK_EFFECT_DURATION_MS,
  PLAYER_ATTACK_EFFECT_HEIGHT,
  PLAYER_ATTACK_EFFECT_OFFSET_DISTANCE,
  PLAYER_ATTACK_EFFECT_TWEEN_SCALE_X,
  PLAYER_ATTACK_EFFECT_TWEEN_SCALE_Y,
  PLAYER_ATTACK_EFFECT_WIDTH,
  PLAYER_COLLISION_RADIUS,
  PLAYER_HEIGHT,
  PLAYER_HEAD_LERP_FACTOR,
  PLAYER_HEAD_OFFSET_DISTANCE,
  PLAYER_HEAD_RADIUS,
  PLAYER_INVULNERABLE_BLINK_ALPHA,
  PLAYER_INVULNERABLE_BLINK_INTERVAL_MS,
  PLAYER_INVULNERABLE_DURATION_MS,
  PLAYER_HIT_COOLDOWN_MS,
  PLAYER_KNOCKBACK_DURATION_MS,
  PLAYER_KNOCKBACK_FORCE,
  PLAYER_POST_HIT_COLLISION_GRACE_MS,
  PLAYER_WIDTH,
  PLAYER_IDLE_ANIMATION_KEY_BY_CLASS,
  PLAYER_IDLE_TEXTURE_KEY_BY_CLASS,
  WARRIOR_STAGE_DISPLAY_HEIGHT,
  WARRIOR_STAGE_DISPLAY_WIDTH,
  WARRIOR_STAGE_ANIMATION_KEY,
  WARRIOR_STAGE_TEXTURE_KEY,
  STAGE_PARALLAX_SCROLL_FACTORS,
  STAGE_PARALLAX_TEXTURE_KEYS,
  WORLD_HEIGHT,
  WORLD_REGION_COLUMNS,
  WORLD_REGION_ROWS,
  WORLD_WIDTH,
  createInitialPlayerState,
} from "../constants/gameConstants";
import {
  STAGE_EXP_LABEL_TEXT,
  STAGE_REGION_LABEL_TEXT,
  STAGE_SURVIVAL_TIME_LABEL_TEXT,
} from "../constants/textConstants";
import {
  DAMAGE_TEXT_DURATION_MS,
  DAMAGE_TEXT_ENEMY_COLOR,
  DAMAGE_TEXT_FONT_FAMILY,
  DAMAGE_TEXT_FONT_SIZE,
  DAMAGE_TEXT_PLAYER_COLOR,
  DAMAGE_TEXT_RISE_DISTANCE,
  DAMAGE_TEXT_SCALE_FROM,
  DAMAGE_TEXT_SCALE_TO,
  DAMAGE_TEXT_STROKE_COLOR,
  DAMAGE_TEXT_STROKE_THICKNESS,
  STAGE_EXP_BAR_BACKGROUND_COLOR,
  STAGE_EXP_BAR_BOTTOM_OFFSET,
  STAGE_EXP_BAR_FILL_COLOR,
  STAGE_EXP_BAR_HEIGHT,
  STAGE_EXP_BAR_HORIZONTAL_PADDING,
  STAGE_EXP_BAR_STROKE_COLOR,
  STAGE_EXP_BAR_STROKE_WIDTH,
  STAGE_EXP_TEXT_COLOR,
  STAGE_EXP_TEXT_FONT_SIZE,
  STAGE_EXP_TEXT_OFFSET_Y,
  STAGE_EXP_TEXT_ORIGIN_X,
  STAGE_EXP_TEXT_ORIGIN_Y,
  STAGE_HP_BAR_BACKGROUND_COLOR,
  STAGE_HP_BAR_FILL_COLOR,
  STAGE_HP_BAR_HEIGHT,
  STAGE_HP_BAR_LOW_FILL_COLOR,
  STAGE_HP_BAR_STROKE_COLOR,
  STAGE_HP_BAR_STROKE_WIDTH,
  STAGE_HP_BAR_WIDTH,
  STAGE_HP_BAR_X,
  STAGE_HP_BAR_Y,
  STAGE_HP_TEXT_COLOR,
  STAGE_HP_TEXT_FONT_SIZE,
  STAGE_HP_TEXT_X,
  STAGE_HP_TEXT_Y,
  STAGE_MINIMAP_BG_COLOR,
  STAGE_MINIMAP_BORDER_COLOR,
  STAGE_MINIMAP_BORDER_WIDTH,
  STAGE_MINIMAP_BOSS_MARKER_COLOR,
  STAGE_MINIMAP_BOSS_MARKER_RADIUS,
  STAGE_MINIMAP_ELITE_MARKER_COLOR,
  STAGE_MINIMAP_ELITE_MARKER_RADIUS,
  STAGE_MINIMAP_ENEMY_MARKER_COLOR,
  STAGE_MINIMAP_ENEMY_MARKER_RADIUS,
  STAGE_MINIMAP_EXP_MARKER_COLOR,
  STAGE_MINIMAP_EXP_MARKER_RADIUS,
  STAGE_MINIMAP_GRID_COLOR,
  STAGE_MINIMAP_HEIGHT,
  STAGE_MINIMAP_MARKER_COLOR,
  STAGE_MINIMAP_MARKER_RADIUS,
  STAGE_MINIMAP_MAX_EXP_MARKERS,
  STAGE_MINIMAP_OBJECT_VISIBLE_RADIUS,
  STAGE_MINIMAP_WIDTH,
  STAGE_MINIMAP_X,
  STAGE_MINIMAP_Y,
  STAGE_REGION_TEXT_COLOR,
  STAGE_REGION_TEXT_FONT_SIZE,
  STAGE_REGION_TEXT_ORIGIN_X,
  STAGE_REGION_TEXT_ORIGIN_Y,
  STAGE_REGION_TEXT_X,
  STAGE_REGION_TEXT_Y,
  STAGE_TIMER_COLOR,
  STAGE_TIMER_FONT_SIZE,
  STAGE_TIMER_ORIGIN_X,
  STAGE_TIMER_ORIGIN_Y,
  STAGE_TIMER_X,
  STAGE_TIMER_Y,
} from "../constants/uiLayoutConstants";
import { eventBus } from "../core/eventBus";
import bosses from "../data/bosses.json";
import { CombatSystem } from "../systems/CombatSystem";
import { ProgressionSystem } from "../systems/ProgressionSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { SynergySystem } from "../systems/SynergySystem";
import type {
  BasicKarmaId,
  KarmaId,
  LevelUpOption,
  PlayerClassType,
  PlayerState,
} from "../shared/gameTypes";

type StageSceneInitData = {
  playerClassType?: PlayerClassType;
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

type ExpOrb = Phaser.GameObjects.Arc;

type KarmaOrb = Phaser.GameObjects.Arc;

type MinimapPoint = {
  x: number;
  y: number;
  radius: number;
  color: number;
};

type BossData = {
  name: string;
  maxHp: number;
  damage: number;
  moveSpeed: number;
  expCoefficient: number;
};

/**
 * @date 2026-04-24
 * @desc ?쇰컲 ?ㅽ뀒?댁? ?앹〈 猷⑦봽瑜?泥섎━?섍퀬 援ш컙留덈떎 蹂댁뒪?꾩쓣 ?몄텧?쒕떎.
 */
export class StageScene extends Phaser.Scene {
  private parallaxFarLayer!: Phaser.GameObjects.TileSprite;
  private parallaxMidLayer!: Phaser.GameObjects.TileSprite;
  private parallaxFrontLayer!: Phaser.GameObjects.TileSprite;
  private player!: Phaser.Physics.Arcade.Sprite;
  private head!: Phaser.GameObjects.Arc;
  private timerText!: Phaser.GameObjects.Text;
  private hpBarBackground!: Phaser.GameObjects.Rectangle;
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private regionText!: Phaser.GameObjects.Text;
  private expBarBackground!: Phaser.GameObjects.Rectangle;
  private expBarFill!: Phaser.GameObjects.Rectangle;
  private expBarText!: Phaser.GameObjects.Text;
  private bossWarningText: Phaser.GameObjects.Text | null = null;
  private minimapBackground!: Phaser.GameObjects.Rectangle;
  private minimapMarker!: Phaser.GameObjects.Arc;
  private minimapGridLines: Phaser.GameObjects.Line[] = [];
  private minimapEnemyMarkers: Phaser.GameObjects.Arc[] = [];
  private minimapExpMarkers: Phaser.GameObjects.Arc[] = [];
  private moveKeys!: MoveKeys;
  private lookKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private monsters: Phaser.GameObjects.Rectangle[] = [];
  private expOrbs: ExpOrb[] = [];
  private karmaOrbs: KarmaOrb[] = [];
  private nextSpawnTimestamp = 0;
  private nextEliteSpawnElapsedMs = ELITE_MONSTER_START_MS;
  private nextPlayerHitTimestamp = 0;
  private nextAutoSkillTimestamp = 0;
  private playerInvulnerableUntil = 0;
  private playerKnockbackUntil = 0;
  private isLevelUpOpen = false;
  private survivalStartTimestamp = 0;
  private survivalElapsedOffsetMs = 0;
  private nextBossTriggerElapsedMs = BOSS_APPEAR_INTERVAL_MS;
  private bossWarningUntilTimestamp = 0;
  private bossPhase = 1;
  private isBossWarningActive = false;
  private initData: StageSceneInitData | undefined;
  private lastDirectionLabel = "Right";
  private readonly lookDirection = new Phaser.Math.Vector2(1, 0);
  private readonly targetLookDirection = new Phaser.Math.Vector2(1, 0);
  private readonly combatSystem = new CombatSystem();
  private readonly progressionSystem = new ProgressionSystem();
  private readonly spawnSystem = new SpawnSystem();
  private readonly synergySystem = new SynergySystem();
  private readonly playerState: PlayerState = createInitialPlayerState(DEFAULT_PLAYER_CLASS_TYPE);
  private readonly selectedOptions: string[] = [];
  private readonly handleLevelUpSelected = (payload: { option: LevelUpOption }) => {
    this.applyLevelUpSelection(payload.option);
  };

  constructor() {
    super("StageScene");
  }

  /**
   * @date 2026-04-24
   * @desc 蹂댁뒪???댄썑 蹂듦? ?곹깭 ?먮뒗 ?좉퇋 ?쒖옉 ?곹깭瑜??꾨떖諛쏅뒗??
   */
  init(data: StageSceneInitData) {
    this.initData = data;
  }

  /**
   * @date 2026-04-24
   * @desc ?ㅽ뀒?댁? ?ㅻ툕?앺듃? ??대㉧, ?낅젰 ?곹깭瑜?珥덇린?뷀븳??
   */
  create() {
    eventBus.emit("scene:changed", "Stage");
    eventBus.emit("combat:target-updated", null);

    this.nextSpawnTimestamp = this.time.now + INITIAL_MONSTER_SPAWN_DELAY_MS;
    this.nextEliteSpawnElapsedMs = ELITE_MONSTER_START_MS;
    this.nextPlayerHitTimestamp = this.time.now;
    this.nextAutoSkillTimestamp = this.time.now;
    this.playerInvulnerableUntil = this.time.now;
    this.playerKnockbackUntil = this.time.now;
    this.bossWarningUntilTimestamp = 0;
    this.survivalStartTimestamp = this.time.now;
    this.isLevelUpOpen = false;
    this.isBossWarningActive = false;
    this.monsters = [];
    this.expOrbs = [];
    this.karmaOrbs = [];
    this.bossWarningText?.destroy();
    this.bossWarningText = null;

    this.applyInitData();
    this.configureWorldAndCamera();
    this.createParallaxLayers();

    const playerTextureKey = this.getPlayerStageTextureKey();
    const playerAnimationKey = this.getPlayerStageAnimationKey();
    const playerDisplaySize = this.getPlayerStageDisplaySize();
    this.player = this.physics.add.sprite(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      playerTextureKey,
    );
    this.player.setDisplaySize(playerDisplaySize.width, playerDisplaySize.height);
    this.player.setOrigin(0.5, 0.5);
    this.player.setDepth(20);
    this.player.anims.play(playerAnimationKey, true);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(PLAYER_WIDTH * 0.65, PLAYER_HEIGHT * 0.75);
    playerBody.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.head = this.add.circle(
      this.player.x + PLAYER_HEAD_OFFSET_DISTANCE,
      this.player.y,
      PLAYER_HEAD_RADIUS,
      0xffffff,
    );
    this.head.setVisible(false);

    this.moveKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as MoveKeys;
    this.lookKeys = this.input.keyboard!.createCursorKeys();
    this.timerText = this.add
      .text(STAGE_TIMER_X, STAGE_TIMER_Y, "", {
        fontSize: STAGE_TIMER_FONT_SIZE,
        color: STAGE_TIMER_COLOR,
      })
      .setOrigin(STAGE_TIMER_ORIGIN_X, STAGE_TIMER_ORIGIN_Y)
      .setScrollFactor(0);
    this.createHpBar();
    this.createMinimap();
    this.createExpBar();
    this.updatePlayerHpBar();
    this.updateTimerText();
    this.updateExpBar();
    this.updateMinimapMarkerAndRegion();
    this.emitPlayerStatsUpdated();
    this.emitPlayerKarmaUpdated();
    this.emitDirectionIfChanged(true);
    this.updateHeadVisual();

    eventBus.on("levelup:selected", this.handleLevelUpSelected);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBus.off("levelup:selected", this.handleLevelUpSelected);
      eventBus.emit("combat:target-updated", null);
    });
  }

  /**
   * @date 2026-04-28
   * @desc 현재 플레이어 직업에 맞는 인게임 스프라이트 텍스처 키를 반환한다.
   */
  private getPlayerStageTextureKey() {
    if (this.playerState.classType === "warrior") {
      return WARRIOR_STAGE_TEXTURE_KEY;
    }

    return PLAYER_IDLE_TEXTURE_KEY_BY_CLASS[this.playerState.classType];
  }

  /**
   * @date 2026-04-28
   * @desc 현재 플레이어 직업에 맞는 인게임 idle 애니메이션 키를 반환한다.
   */
  private getPlayerStageAnimationKey() {
    if (this.playerState.classType === "warrior") {
      return WARRIOR_STAGE_ANIMATION_KEY;
    }

    return PLAYER_IDLE_ANIMATION_KEY_BY_CLASS[this.playerState.classType];
  }

  /**
   * @date 2026-04-28
   * @desc 현재 플레이어 직업에 맞는 인게임 표시 크기를 반환한다.
   */
  private getPlayerStageDisplaySize() {
    if (this.playerState.classType === "warrior") {
      return {
        width: WARRIOR_STAGE_DISPLAY_WIDTH,
        height: WARRIOR_STAGE_DISPLAY_HEIGHT,
      };
    }

    return {
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };
  }

  /**
   * @date 2026-04-24
   * @desc ?꾨젅?꾨쭏???앹〈 ?쒓컙, ?대룞, ?꾪닾, 蹂댁뒪 ?몃━嫄곕? 媛깆떊?쒕떎.
   */
  update() {
    this.updateParallaxLayers();
    this.updateTimerText();
    this.updatePlayerHpBar();
    this.updateExpBar();
    this.updateMinimapMarkerAndRegion();
    this.updatePlayerInvulnerabilityVisual();
    this.updateLookDirectionTarget();
    this.updateSmoothLookDirection();
    this.updatePlayerSpriteFacing();
    this.emitDirectionIfChanged(false);
    this.updateHeadVisual();

    if (this.isLevelUpOpen) {
      return;
    }

    this.updatePlayerMovement();
    this.updateMonsterMovement();
    this.updateExpOrbs();
    this.updateKarmaOrbs();
    this.handleAutoSkill();
    this.spawnMonstersIfNeeded();
    this.handlePlayerCollisionDamage();
    this.handleExpBasedLevelUp();
    this.handleBossTrigger();
  }

  /**
   * @date 2026-04-24
   * @desc ?꾨떖諛쏆? 珥덇린???곗씠?곕? ?꾩옱 ?ㅽ뀒?댁? ?곹깭??諛섏쁺?쒕떎.
   */
  private applyInitData() {
    if (!this.initData || !this.initData.playerState) {
      const selectedClassType = this.initData?.playerClassType ?? DEFAULT_PLAYER_CLASS_TYPE;
      const initialPlayerState = createInitialPlayerState(selectedClassType);
      this.applyPlayerState(initialPlayerState);
      this.selectedOptions.length = 0;
      this.survivalElapsedOffsetMs = 0;
      this.nextBossTriggerElapsedMs = BOSS_APPEAR_INTERVAL_MS;
      this.nextEliteSpawnElapsedMs = ELITE_MONSTER_START_MS;
      this.bossPhase = 1;
      this.isBossWarningActive = false;
      this.bossWarningUntilTimestamp = 0;
      this.lookDirection.set(1, 0);
      this.targetLookDirection.set(1, 0);
      this.lastDirectionLabel = "Right";
      return;
    }

    this.applyPlayerState(this.initData.playerState);
    this.selectedOptions.length = 0;
    (this.initData.selectedOptions ?? []).forEach((optionName) => {
      this.selectedOptions.push(optionName);
    });
    this.survivalElapsedOffsetMs = this.initData.survivalElapsedMs ?? 0;
    this.nextBossTriggerElapsedMs =
      this.initData.nextBossTriggerElapsedMs ?? BOSS_APPEAR_INTERVAL_MS;
    this.nextEliteSpawnElapsedMs = this.computeNextEliteSpawnElapsedMs(this.getSurvivalElapsedMs());
    this.bossPhase = this.initData.bossPhase ?? 1;
    this.isBossWarningActive = false;
    this.bossWarningUntilTimestamp = 0;
    this.lookDirection.set(1, 0);
    this.targetLookDirection.set(1, 0);
    this.lastDirectionLabel = "Right";
  }

  /**
   * @date 2026-04-28
   * @desc 전달받은 플레이어 상태를 현재 스테이지 상태에 복사한다.
   */
  private applyPlayerState(nextPlayerState: PlayerState) {
    this.playerState.classType = nextPlayerState.classType;
    this.playerState.level = nextPlayerState.level;
    this.playerState.exp = nextPlayerState.exp;
    this.playerState.maxHp = nextPlayerState.maxHp;
    this.playerState.hp = nextPlayerState.hp;
    this.playerState.baseDamage = nextPlayerState.baseDamage;
    this.playerState.damage = nextPlayerState.damage;
    this.playerState.baseAttackRange = nextPlayerState.baseAttackRange;
    this.playerState.attackRange = nextPlayerState.attackRange;
    this.playerState.moveSpeed = nextPlayerState.moveSpeed;
    this.playerState.pickupRadius = nextPlayerState.pickupRadius;
    this.playerState.cooldownMultiplier = nextPlayerState.cooldownMultiplier;
    this.playerState.areaMultiplier = nextPlayerState.areaMultiplier;
    this.playerState.expMultiplier = nextPlayerState.expMultiplier;
    this.playerState.criticalChance = nextPlayerState.criticalChance;
    this.playerState.criticalDamageMultiplier = nextPlayerState.criticalDamageMultiplier;
    this.playerState.attackCount = nextPlayerState.attackCount;
    this.playerState.statStacks = { ...nextPlayerState.statStacks };
    this.playerState.karmaCounts = { ...nextPlayerState.karmaCounts };
    this.playerState.skills = nextPlayerState.skills.map((skill) => ({ ...skill }));
    this.playerState.passives = nextPlayerState.passives.map((passive) => ({ ...passive }));
  }

  /**
   * @date 2026-04-28
   * @desc React HUD에서 사용할 플레이어 레벨과 스탯 스택 정보를 발행한다.
   */
  private emitPlayerStatsUpdated() {
    eventBus.emit("player:stats-updated", {
      level: this.playerState.level,
      statStacks: { ...this.playerState.statStacks },
    });
  }

  /**
   * @date 2026-04-28
   * @desc React HUD에서 사용할 카르마 보유량 정보를 발행한다.
   */
  private emitPlayerKarmaUpdated() {
    eventBus.emit("player:karma-updated", {
      karmaCounts: { ...this.playerState.karmaCounts },
    });
  }

  /**
   * @date 2026-04-27
   * @desc 월드/물리 경계와 카메라 이동 경계를 확장 월드 크기로 설정한다.
   */
  private configureWorldAndCamera() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBackgroundColor("#0f172a");
  }

  /**
   * @date 2026-04-27
   * @desc 원경/중경/전경 타일 스프라이트를 생성해 패럴랙스 배경 레이어를 구성한다.
   */
  private createParallaxLayers() {
    this.parallaxFarLayer = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, STAGE_PARALLAX_TEXTURE_KEYS.far)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-60);

    this.parallaxMidLayer = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, STAGE_PARALLAX_TEXTURE_KEYS.mid)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-50);

    this.parallaxFrontLayer = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, STAGE_PARALLAX_TEXTURE_KEYS.front)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-40);
  }

  /**
   * @date 2026-04-27
   * @desc 카메라 스크롤 값을 기준으로 배경 레이어의 타일 오프셋을 갱신한다.
   */
  private updateParallaxLayers() {
    if (!this.parallaxFarLayer || !this.parallaxMidLayer || !this.parallaxFrontLayer) {
      return;
    }

    const camera = this.cameras.main;
    this.parallaxFarLayer.tilePositionX = camera.scrollX * STAGE_PARALLAX_SCROLL_FACTORS.far.x;
    this.parallaxFarLayer.tilePositionY = camera.scrollY * STAGE_PARALLAX_SCROLL_FACTORS.far.y;
    this.parallaxMidLayer.tilePositionX = camera.scrollX * STAGE_PARALLAX_SCROLL_FACTORS.mid.x;
    this.parallaxMidLayer.tilePositionY = camera.scrollY * STAGE_PARALLAX_SCROLL_FACTORS.mid.y;
    this.parallaxFrontLayer.tilePositionX =
      camera.scrollX * STAGE_PARALLAX_SCROLL_FACTORS.front.x;
    this.parallaxFrontLayer.tilePositionY =
      camera.scrollY * STAGE_PARALLAX_SCROLL_FACTORS.front.y;
  }

  /**
   * @date 2026-04-27
   * @desc 미니맵 배경, 격자, 플레이어 위치 마커, 구간 텍스트를 생성한다.
   */
  private createMinimap() {
    this.minimapBackground = this.add.rectangle(
      STAGE_MINIMAP_X,
      STAGE_MINIMAP_Y,
      STAGE_MINIMAP_WIDTH,
      STAGE_MINIMAP_HEIGHT,
      STAGE_MINIMAP_BG_COLOR,
    );
    this.minimapBackground.setOrigin(0, 0);
    this.minimapBackground.setStrokeStyle(STAGE_MINIMAP_BORDER_WIDTH, STAGE_MINIMAP_BORDER_COLOR);
    this.minimapBackground.setScrollFactor(0);

    this.createMinimapGridLines();

    this.minimapMarker = this.add.circle(
      STAGE_MINIMAP_X,
      STAGE_MINIMAP_Y,
      STAGE_MINIMAP_MARKER_RADIUS,
      STAGE_MINIMAP_MARKER_COLOR,
    );
    this.minimapMarker.setScrollFactor(0);
    this.minimapMarker.setDepth(95);

    this.regionText = this.add
      .text(STAGE_REGION_TEXT_X, STAGE_REGION_TEXT_Y, "", {
        fontSize: STAGE_REGION_TEXT_FONT_SIZE,
        color: STAGE_REGION_TEXT_COLOR,
      })
      .setOrigin(STAGE_REGION_TEXT_ORIGIN_X, STAGE_REGION_TEXT_ORIGIN_Y)
      .setScrollFactor(0);
  }

  /**
   * @date 2026-04-27
   * @desc 미니맵 격자를 컬럼/로우 기준으로 그린다.
   */
  private createMinimapGridLines() {
    this.minimapGridLines.forEach((lineObject) => {
      lineObject.destroy();
    });
    this.minimapGridLines = [];

    for (let columnIndex = 1; columnIndex < WORLD_REGION_COLUMNS; columnIndex += 1) {
      const x =
        STAGE_MINIMAP_X + (STAGE_MINIMAP_WIDTH / WORLD_REGION_COLUMNS) * columnIndex;
      const lineObject = this.add.line(
        0,
        0,
        x,
        STAGE_MINIMAP_Y,
        x,
        STAGE_MINIMAP_Y + STAGE_MINIMAP_HEIGHT,
        STAGE_MINIMAP_GRID_COLOR,
      );
      lineObject.setOrigin(0, 0);
      lineObject.setScrollFactor(0);
      lineObject.setLineWidth(1, 1);
      this.minimapGridLines.push(lineObject);
    }

    for (let rowIndex = 1; rowIndex < WORLD_REGION_ROWS; rowIndex += 1) {
      const y = STAGE_MINIMAP_Y + (STAGE_MINIMAP_HEIGHT / WORLD_REGION_ROWS) * rowIndex;
      const lineObject = this.add.line(
        0,
        0,
        STAGE_MINIMAP_X,
        y,
        STAGE_MINIMAP_X + STAGE_MINIMAP_WIDTH,
        y,
        STAGE_MINIMAP_GRID_COLOR,
      );
      lineObject.setOrigin(0, 0);
      lineObject.setScrollFactor(0);
      lineObject.setLineWidth(1, 1);
      this.minimapGridLines.push(lineObject);
    }
  }

  /**
   * @date 2026-04-24
   * @desc WASD ?낅젰?쇰줈 ?뚮젅?댁뼱 ?대룞 ?띾룄瑜?媛깆떊?쒕떎.
   */
  private updatePlayerMovement() {
    if (this.time.now < this.playerKnockbackUntil) {
      return;
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setVelocity(0, 0);

    if (this.moveKeys.left.isDown) {
      playerBody.setVelocityX(-this.playerState.moveSpeed);
    } else if (this.moveKeys.right.isDown) {
      playerBody.setVelocityX(this.playerState.moveSpeed);
    }

    if (this.moveKeys.up.isDown) {
      playerBody.setVelocityY(-this.playerState.moveSpeed);
    } else if (this.moveKeys.down.isDown) {
      playerBody.setVelocityY(this.playerState.moveSpeed);
    }
  }

  /**
   * @date 2026-04-24
   * @desc 留덉슦???ъ씤?곕? ?곗꽑?쇰줈 紐⑺몴 ?쒖꽑 諛⑺뼢???ㅼ젙?섍퀬, 踰붿쐞 諛뽰뿉?쒕뒗 ?붿궡???낅젰???ъ슜?쒕떎.
   */
  private updateLookDirectionTarget() {
    const activePointer = this.input.activePointer;
    const isPointerInGameArea =
      activePointer.x >= 0 &&
      activePointer.x <= GAME_WIDTH &&
      activePointer.y >= 0 &&
      activePointer.y <= GAME_HEIGHT;
    if (isPointerInGameArea) {
      const pointerDeltaX = activePointer.worldX - this.player.x;
      const pointerDeltaY = activePointer.worldY - this.player.y;
      const pointerDistance = Math.hypot(pointerDeltaX, pointerDeltaY);
      if (pointerDistance > LOOK_POINTER_MIN_DISTANCE) {
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
   * @desc ?꾩옱 ?쒖꽑 諛⑺뼢??紐⑺몴 ?쒖꽑 諛⑺뼢?쇰줈 遺?쒕읇寃?蹂닿컙?쒕떎.
   */
  private updateSmoothLookDirection() {
    this.lookDirection.x = Phaser.Math.Linear(
      this.lookDirection.x,
      this.targetLookDirection.x,
      LOOK_DIRECTION_SMOOTHING_FACTOR,
    );
    this.lookDirection.y = Phaser.Math.Linear(
      this.lookDirection.y,
      this.targetLookDirection.y,
      LOOK_DIRECTION_SMOOTHING_FACTOR,
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
   * @desc ?쒖꽑 踰≫꽣瑜?湲곗??쇰줈 癒몃━ ?꾩튂瑜?遺?쒕읇寃?媛깆떊?쒕떎.
   */
  private updateHeadVisual() {
    const targetHeadX = this.player.x + this.lookDirection.x * PLAYER_HEAD_OFFSET_DISTANCE;
    const targetHeadY = this.player.y + this.lookDirection.y * PLAYER_HEAD_OFFSET_DISTANCE;
    this.head.x = Phaser.Math.Linear(this.head.x, targetHeadX, PLAYER_HEAD_LERP_FACTOR);
    this.head.y = Phaser.Math.Linear(this.head.y, targetHeadY, PLAYER_HEAD_LERP_FACTOR);
  }

  /**
   * @date 2026-04-27
   * @desc 현재 시선 방향의 x축 부호를 기준으로 플레이어 스프라이트 반전값을 갱신한다.
   */
  private updatePlayerSpriteFacing() {
    if (Math.abs(this.lookDirection.x) < 0.01) {
      return;
    }

    this.player.setFlipX(this.lookDirection.x < 0);
  }

  /**
   * @date 2026-04-24
   * @desc ?꾩옱 ?쒖꽑 ?쇰꺼???ㅻ뜑??諛쒗뻾?쒕떎.
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
   * @desc ?꾩옱 ?쒖꽑 踰≫꽣瑜??띿뒪??諛⑺뼢 媛믪쑝濡?蹂?섑븳??
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
   * @desc 紐ъ뒪?곕? ?뚮젅?댁뼱 ?꾩튂濡?異붿쟻 ?대룞?쒗궓??
   */
  private updateMonsterMovement() {
    this.monsters.forEach((monster) => {
      const monsterBody = monster.body as Phaser.Physics.Arcade.Body;
      const knockbackUntil = Number(monster.getData("knockbackUntil") ?? 0);
      if (this.time.now < knockbackUntil) {
        return;
      }

      const deltaX = this.player.x - monster.x;
      const deltaY = this.player.y - monster.y;
      const length = Math.hypot(deltaX, deltaY) || 1;
      const moveSpeed = Number(monster.getData("moveSpeed") ?? MONSTER_SPEED);

      monsterBody.setVelocity((deltaX / length) * moveSpeed, (deltaY / length) * moveSpeed);
    });
  }

  /**
   * @date 2026-04-24
   * @desc 보유 스킬 쿨다운에 맞춰 가장 가까운 몬스터에게 자동 공격을 적용한다.
   */
  private handleAutoSkill() {
    if (this.playerState.skills.length === 0) {
      return;
    }

    if (this.time.now < this.nextAutoSkillTimestamp) {
      return;
    }

    const targetMonsters = this.findNearestAttackTargets(
      this.playerState.attackRange,
      this.playerState.attackCount,
    );
    if (targetMonsters.length === 0) {
      return;
    }

    const targetMonster = targetMonsters[0];
    this.updateAutoSkillLookDirection(targetMonster);
    this.nextAutoSkillTimestamp =
      this.time.now + AUTO_SKILL_COOLDOWN_MS * this.playerState.cooldownMultiplier;
    this.playAttackEffect();
    targetMonsters.forEach((monster) => {
      this.damageMonster(monster, this.playerState.damage);
    });
  }

  /**
   * @date 2026-04-28
   * @desc 자동 스킬 대상 방향으로 플레이어 시선 벡터를 갱신한다.
   */
  private updateAutoSkillLookDirection(targetMonster: Phaser.GameObjects.Rectangle) {
    const deltaX = targetMonster.x - this.player.x;
    const deltaY = targetMonster.y - this.player.y;
    const distance = Math.hypot(deltaX, deltaY) || 1;
    this.targetLookDirection.set(deltaX / distance, deltaY / distance);
    this.lookDirection.set(deltaX / distance, deltaY / distance);
  }

  /**
   * @date 2026-04-28
   * @desc 몬스터에게 데미지와 넉백, 처치 보상을 적용한다.
   */
  private damageMonster(targetMonster: Phaser.GameObjects.Rectangle, baseDamage: number) {
    const currentHp = Number(targetMonster.getData("hp") ?? 0);
    const maxHp = Number(targetMonster.getData("maxHp") ?? currentHp);
    const targetName = String(targetMonster.getData("name") ?? "Monster");
    const synergy = this.synergySystem.evaluate(this.selectedOptions);
    const isCriticalHit = this.randomProviderForCriticalHit();
    const criticalMultiplier = isCriticalHit ? this.playerState.criticalDamageMultiplier : 1;
    const dealtDamage = Math.max(1, Math.round((baseDamage + synergy.bonusDamage) * criticalMultiplier));
    const nextHp = this.combatSystem.applyDamage(currentHp, dealtDamage);
    targetMonster.setData("hp", nextHp);
    this.applyMonsterKnockback(targetMonster);
    this.showDamageText(targetMonster.x, targetMonster.y - 28, dealtDamage, "enemy");
    eventBus.emit("combat:target-updated", {
      name: targetName,
      hp: nextHp,
      maxHp,
    });

    if (nextHp <= 0) {
      const expReward = Number(targetMonster.getData("expReward") ?? 1);
      const monsterGrade = String(targetMonster.getData("grade") ?? "normal");
      this.dropExpOrbs(targetMonster.x, targetMonster.y, expReward);
      this.dropKarmaOrb(targetMonster.x, targetMonster.y, monsterGrade);
      const isBoss = Boolean(targetMonster.getData("isBoss"));
      targetMonster.destroy();
      this.monsters = this.monsters.filter((monster) => monster.active);
      if (isBoss) {
        this.handleBossDefeated();
      }
    }
  }

  /**
   * @date 2026-04-28
   * @desc 몬스터 처치 위치에 경험치 보상량을 담은 구슬 1개를 생성한다.
   */
  private dropExpOrbs(worldX: number, worldY: number, expReward: number) {
    const scatterAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const scatterDistance = Phaser.Math.FloatBetween(0, EXP_ORB_SCATTER_RADIUS);
    const orbX = Phaser.Math.Clamp(
      worldX + Math.cos(scatterAngle) * scatterDistance,
      EXP_ORB_RADIUS,
      WORLD_WIDTH - EXP_ORB_RADIUS,
    );
    const orbY = Phaser.Math.Clamp(
      worldY + Math.sin(scatterAngle) * scatterDistance,
      EXP_ORB_RADIUS,
      WORLD_HEIGHT - EXP_ORB_RADIUS,
    );
    this.createExpOrb(orbX, orbY, Math.max(1, Math.round(expReward)));
  }

  /**
   * @date 2026-04-28
   * @desc 경험치 구슬을 생성하거나 최대 개수 초과 시 기존 구슬에 병합한다.
   */
  private createExpOrb(worldX: number, worldY: number, expValue: number) {
    if (this.expOrbs.length >= EXP_ORB_MAX_COUNT) {
      this.mergeExpOrb(worldX, worldY, expValue);
      return;
    }

    const expOrb = this.add.circle(worldX, worldY, EXP_ORB_RADIUS, EXP_ORB_COLOR);
    expOrb.setStrokeStyle(EXP_ORB_STROKE_WIDTH, EXP_ORB_STROKE_COLOR);
    expOrb.setDepth(EXP_ORB_DEPTH);
    expOrb.setData("expValue", expValue);
    expOrb.setData("createdAt", this.time.now);
    expOrb.setData("isAttracting", false);
    this.expOrbs.push(expOrb);
  }

  /**
   * @date 2026-04-28
   * @desc 최대 구슬 수를 넘지 않도록 가장 가까운 기존 구슬에 경험치를 합산한다.
   */
  private mergeExpOrb(worldX: number, worldY: number, expValue: number) {
    const targetOrb = this.findNearestExpOrb(worldX, worldY);
    if (!targetOrb) {
      return;
    }

    const previousExpValue = Number(targetOrb.getData("expValue") ?? 0);
    targetOrb.setData("expValue", previousExpValue + expValue);
    targetOrb.setScale(Math.min(1.8, targetOrb.scaleX + 0.02));
  }

  /**
   * @date 2026-04-28
   * @desc 기준 좌표와 가장 가까운 경험치 구슬을 반환한다.
   */
  private findNearestExpOrb(worldX: number, worldY: number): ExpOrb | null {
    let nearestOrb: ExpOrb | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const expOrb of this.expOrbs) {
      const distance = Phaser.Math.Distance.Between(worldX, worldY, expOrb.x, expOrb.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestOrb = expOrb;
      }
    }

    return nearestOrb;
  }

  /**
   * @date 2026-04-28
   * @desc 경험치 구슬의 획득 반경 진입 후 끊기지 않는 자석 흡수를 갱신한다.
   */
  private updateExpOrbs() {
    const deltaSeconds = this.game.loop.delta / 1000;
    this.expOrbs.forEach((expOrb) => {
      if (!expOrb.active) {
        return;
      }

      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        expOrb.x,
        expOrb.y,
      );
      const isAttracting = Boolean(expOrb.getData("isAttracting"));

      if (isAttracting && distanceToPlayer <= EXP_ORB_ABSORB_DISTANCE) {
        this.absorbExpOrb(expOrb);
        return;
      }

      if (!isAttracting && distanceToPlayer > this.playerState.pickupRadius) {
        return;
      }

      expOrb.setData("isAttracting", true);
      this.moveExpOrbTowardPlayer(expOrb, distanceToPlayer, deltaSeconds);
    });
    this.expOrbs = this.expOrbs.filter((expOrb) => expOrb.active);
  }

  /**
   * @date 2026-04-28
   * @desc 경험치 구슬을 거리 비례 속도로 플레이어 방향으로 이동시킨다.
   */
  private moveExpOrbTowardPlayer(
    expOrb: ExpOrb,
    distanceToPlayer: number,
    deltaSeconds: number,
  ) {
    const distance = Math.max(distanceToPlayer, 0.0001);
    const directionX = (this.player.x - expOrb.x) / distance;
    const directionY = (this.player.y - expOrb.y) / distance;
    const moveSpeed = Phaser.Math.Clamp(
      distance * EXP_ORB_MOVE_SPEED_FACTOR,
      EXP_ORB_MIN_MOVE_SPEED,
      EXP_ORB_MAX_MOVE_SPEED,
    );

    expOrb.x += directionX * moveSpeed * deltaSeconds;
    expOrb.y += directionY * moveSpeed * deltaSeconds;
  }

  /**
   * @date 2026-04-28
   * @desc 경험치 구슬을 흡수해 플레이어 경험치로 전환한다.
   */
  private absorbExpOrb(expOrb: ExpOrb) {
    const expValue = Number(expOrb.getData("expValue") ?? 1);
    const gainedExp = Math.max(1, Math.round(expValue * this.playerState.expMultiplier));
    this.progressionSystem.grantExp(this.playerState, gainedExp);
    expOrb.destroy();
  }

  /**
   * @date 2026-04-28
   * @desc 몬스터 처치 위치에 드랍 정책에 맞는 카르마 구슬 1개를 생성한다.
   */
  private dropKarmaOrb(worldX: number, worldY: number, monsterGrade: string) {
    const karmaId = this.pickDroppedKarmaId(monsterGrade);
    const scatterAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const scatterDistance = Phaser.Math.FloatBetween(0, KARMA_ORB_SCATTER_RADIUS);
    const orbX = Phaser.Math.Clamp(
      worldX + Math.cos(scatterAngle) * scatterDistance,
      KARMA_ORB_RADIUS,
      WORLD_WIDTH - KARMA_ORB_RADIUS,
    );
    const orbY = Phaser.Math.Clamp(
      worldY + Math.sin(scatterAngle) * scatterDistance,
      KARMA_ORB_RADIUS,
      WORLD_HEIGHT - KARMA_ORB_RADIUS,
    );

    this.createKarmaOrb(orbX, orbY, karmaId);
  }

  /**
   * @date 2026-04-28
   * @desc 몬스터 등급과 확률에 따라 드랍할 카르마 타입을 결정한다.
   */
  private pickDroppedKarmaId(monsterGrade: string): KarmaId {
    if (monsterGrade === "elite") {
      return "transformShard";
    }

    if (Math.random() > KARMA_BASIC_DROP_RATE) {
      return "transformShard";
    }

    return this.pickBasicKarmaId();
  }

  /**
   * @date 2026-04-28
   * @desc 기본 카르마 6종 중 하나를 무작위로 반환한다.
   */
  private pickBasicKarmaId(): BasicKarmaId {
    const karmaIds: BasicKarmaId[] = ["fire", "water", "wind", "rock", "dark", "holy"];
    const selectedIndex = Phaser.Math.Between(0, karmaIds.length - 1);
    return karmaIds[selectedIndex];
  }

  /**
   * @date 2026-04-28
   * @desc 카르마 구슬을 생성하고 흡수 상태 데이터를 초기화한다.
   */
  private createKarmaOrb(worldX: number, worldY: number, karmaId: KarmaId) {
    const karmaOrb = this.add.circle(worldX, worldY, KARMA_ORB_RADIUS, KARMA_COLOR_BY_ID[karmaId]);
    karmaOrb.setStrokeStyle(KARMA_ORB_STROKE_WIDTH, KARMA_ORB_STROKE_COLOR);
    karmaOrb.setDepth(KARMA_ORB_DEPTH);
    karmaOrb.setData("karmaId", karmaId);
    karmaOrb.setData("isAttracting", false);
    this.karmaOrbs.push(karmaOrb);
  }

  /**
   * @date 2026-04-28
   * @desc 카르마 구슬의 획득 반경 진입 후 끊기지 않는 자석 흡수를 갱신한다.
   */
  private updateKarmaOrbs() {
    const deltaSeconds = this.game.loop.delta / 1000;
    this.karmaOrbs.forEach((karmaOrb) => {
      if (!karmaOrb.active) {
        return;
      }

      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        karmaOrb.x,
        karmaOrb.y,
      );
      const isAttracting = Boolean(karmaOrb.getData("isAttracting"));

      if (isAttracting && distanceToPlayer <= KARMA_ORB_ABSORB_DISTANCE) {
        this.absorbKarmaOrb(karmaOrb);
        return;
      }

      if (!isAttracting && distanceToPlayer > this.playerState.pickupRadius) {
        return;
      }

      karmaOrb.setData("isAttracting", true);
      this.moveKarmaOrbTowardPlayer(karmaOrb, distanceToPlayer, deltaSeconds);
    });
    this.karmaOrbs = this.karmaOrbs.filter((karmaOrb) => karmaOrb.active);
  }

  /**
   * @date 2026-04-28
   * @desc 카르마 구슬을 거리 비례 속도로 플레이어 방향으로 이동시킨다.
   */
  private moveKarmaOrbTowardPlayer(
    karmaOrb: KarmaOrb,
    distanceToPlayer: number,
    deltaSeconds: number,
  ) {
    const distance = Math.max(distanceToPlayer, 0.0001);
    const directionX = (this.player.x - karmaOrb.x) / distance;
    const directionY = (this.player.y - karmaOrb.y) / distance;
    const moveSpeed = Phaser.Math.Clamp(
      distance * KARMA_ORB_MOVE_SPEED_FACTOR,
      KARMA_ORB_MIN_MOVE_SPEED,
      KARMA_ORB_MAX_MOVE_SPEED,
    );

    karmaOrb.x += directionX * moveSpeed * deltaSeconds;
    karmaOrb.y += directionY * moveSpeed * deltaSeconds;
  }

  /**
   * @date 2026-04-28
   * @desc 카르마 구슬을 보유량으로 전환하고 HUD 갱신 이벤트를 발행한다.
   */
  private absorbKarmaOrb(karmaOrb: KarmaOrb) {
    const karmaId = String(karmaOrb.getData("karmaId") ?? "fire") as KarmaId;
    if (!this.canCollectKarma(karmaId)) {
      karmaOrb.destroy();
      return;
    }

    this.playerState.karmaCounts[karmaId] += 1;
    karmaOrb.destroy();
    this.emitPlayerKarmaUpdated();
  }

  /**
   * @date 2026-04-28
   * @desc 카르마 타입별 보유 제한에 따라 획득 가능 여부를 판단한다.
   */
  private canCollectKarma(karmaId: KarmaId) {
    const maxCount =
      karmaId === "transformShard" ? KARMA_TRANSFORM_SHARD_MAX_COUNT : KARMA_BASIC_MAX_COUNT;
    return this.playerState.karmaCounts[karmaId] < maxCount;
  }

  /**
   * @date 2026-04-28
   * @desc 현재 치명타 확률을 기준으로 치명타 발생 여부를 반환한다.
   */
  private randomProviderForCriticalHit() {
    return Math.random() < this.playerState.criticalChance;
  }

  /**
   * @date 2026-04-28
   * @desc 공격 범위 안에서 가까운 순서로 자동 공격 대상들을 찾는다.
   */
  private findNearestAttackTargets(attackRange: number, targetCount: number) {
    const attackCandidates = this.monsters
      .map((monster) => {
        const deltaX = monster.x - this.player.x;
        const deltaY = monster.y - this.player.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > attackRange) {
          return null;
        }

        return {
          monster,
          distance,
        };
      })
      .filter((candidate): candidate is { monster: Phaser.GameObjects.Rectangle; distance: number } => {
        return candidate !== null;
      });

    attackCandidates.sort((leftCandidate, rightCandidate) => {
      return leftCandidate.distance - rightCandidate.distance;
    });

    return attackCandidates.slice(0, Math.max(1, targetCount)).map((candidate) => candidate.monster);
  }

  /**
   * @date 2026-04-24
   * @desc 二쇨린?곸쑝濡?紐ъ뒪?곕? ?앹꽦?쒕떎.
   */
  private spawnMonstersIfNeeded() {
    if (this.time.now < this.nextSpawnTimestamp) {
      return;
    }

    const survivalElapsedMs = this.getSurvivalElapsedMs();
    const waveConfig = this.spawnSystem.getWaveConfig(survivalElapsedMs);
    this.nextSpawnTimestamp = this.time.now + waveConfig.spawnIntervalMs;

    for (let spawnIndex = 0; spawnIndex < waveConfig.spawnCount; spawnIndex += 1) {
      const monster = this.spawnSystem.spawnMonster(
        this,
        this.player.x,
        this.player.y,
        survivalElapsedMs,
      );
      this.monsters.push(monster);
    }

    this.spawnEliteMonsterIfNeeded(survivalElapsedMs);
  }

  /**
   * @date 2026-04-28
   * @desc 엘리트 등장 시간이 되면 확정 엘리트를 스폰하고 다음 등장 시간을 예약한다.
   */
  private spawnEliteMonsterIfNeeded(survivalElapsedMs: number) {
    if (survivalElapsedMs < this.nextEliteSpawnElapsedMs) {
      return;
    }

    const eliteMonster = this.spawnSystem.spawnMonster(
      this,
      this.player.x,
      this.player.y,
      survivalElapsedMs,
      "elite",
    );
    this.monsters.push(eliteMonster);
    this.nextEliteSpawnElapsedMs = this.computeNextEliteSpawnElapsedMs(survivalElapsedMs);
  }

  /**
   * @date 2026-04-28
   * @desc 현재 생존 시간을 기준으로 다음 엘리트 등장 시간을 계산한다.
   */
  private computeNextEliteSpawnElapsedMs(currentElapsedMs: number) {
    const nextIntervalMs = Phaser.Math.Between(
      ELITE_MONSTER_MIN_INTERVAL_MS,
      ELITE_MONSTER_MAX_INTERVAL_MS,
    );
    return Math.max(ELITE_MONSTER_START_MS, currentElapsedMs + nextIntervalMs);
  }

  /**
   * @date 2026-04-24
   * @desc ?뚮젅?댁뼱? 紐ъ뒪???묒큺 ??二쇨린 ?쇳빐瑜??곸슜?섍퀬 ?щ쭩 ??寃곌낵 ?ъ쑝濡??꾪솚?쒕떎.
   */
  private handlePlayerCollisionDamage() {
    if (this.time.now < this.nextPlayerHitTimestamp) {
      return;
    }

    const collision = this.getCollisionDamage();
    if (!collision) {
      return;
    }

    if (this.time.now < this.playerInvulnerableUntil) {
      return;
    }

    const hitBlockDurationMs = Math.max(
      PLAYER_HIT_COOLDOWN_MS,
      PLAYER_INVULNERABLE_DURATION_MS + PLAYER_POST_HIT_COLLISION_GRACE_MS,
    );
    this.nextPlayerHitTimestamp = this.time.now + hitBlockDurationMs;
    this.playerInvulnerableUntil = this.time.now + PLAYER_INVULNERABLE_DURATION_MS;
    this.playerState.hp = this.combatSystem.applyDamage(this.playerState.hp, collision.damage);
    this.showDamageText(this.player.x, this.player.y - 34, collision.damage, "player");
    this.applyPlayerKnockback(collision.monster);

    if (this.combatSystem.isDead(this.playerState.hp)) {
      eventBus.emit("combat:target-updated", null);
      this.scene.start("ResultScene", { result: "dead" });
    }
  }

  /**
   * @date 2026-04-27
   * @desc ?꾩옱 異⑸룎 以묒씤 紐ъ뒪?곕뱾???쇳빐??以?理쒕?媛믪쓣 諛섑솚?쒕떎.
   */
  private getCollisionDamage() {
    let highestDamage = 0;
    let sourceMonster: Phaser.GameObjects.Rectangle | null = null;

    this.monsters.forEach((monster) => {
      const isColliding =
        Phaser.Math.Distance.Between(this.player.x, this.player.y, monster.x, monster.y) <=
        PLAYER_COLLISION_RADIUS;
      if (!isColliding) {
        return;
      }

      const monsterDamage = Number(monster.getData("damage") ?? 0);
      if (monsterDamage > highestDamage) {
        highestDamage = monsterDamage;
        sourceMonster = monster;
      }
    });

    if (highestDamage <= 0 || !sourceMonster) {
      return null;
    }

    return {
      damage: highestDamage,
      monster: sourceMonster,
    };
  }

  /**
   * @date 2026-04-27
   * @desc 플레이어 공격 적중 시 대상 몬스터에 짧은 넉백을 적용한다.
   */
  private applyMonsterKnockback(monster: Phaser.GameObjects.Rectangle) {
    const monsterBody = monster.body as Phaser.Physics.Arcade.Body;
    monsterBody.setVelocity(
      this.lookDirection.x * MONSTER_KNOCKBACK_FORCE,
      this.lookDirection.y * MONSTER_KNOCKBACK_FORCE,
    );
    monster.setData("knockbackUntil", this.time.now + MONSTER_KNOCKBACK_DURATION_MS);
  }

  /**
   * @date 2026-04-27
   * @desc 플레이어 피격 시 충돌 몬스터 반대 방향으로 넉백을 적용한다.
   */
  private applyPlayerKnockback(sourceMonster: Phaser.GameObjects.Rectangle) {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const deltaX = this.player.x - sourceMonster.x;
    const deltaY = this.player.y - sourceMonster.y;
    const distance = Math.hypot(deltaX, deltaY) || 1;
    playerBody.setVelocity(
      (deltaX / distance) * PLAYER_KNOCKBACK_FORCE,
      (deltaY / distance) * PLAYER_KNOCKBACK_FORCE,
    );
    this.playerKnockbackUntil = this.time.now + PLAYER_KNOCKBACK_DURATION_MS;
  }

  /**
   * @date 2026-04-24
   * @desc 寃쏀뿕移섍? ?덈꺼??湲곗????꾨떖?덉쓣 ???좏깮吏瑜??쒖떆?쒕떎.
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
   * @desc ?덈꺼???좏깮吏瑜?EventBus濡??꾨떖?섍퀬 ?쇱떆?뺤? ?곹깭瑜??쒖꽦?뷀븳??
   */
  private showLevelUpOptions() {
    this.isLevelUpOpen = true;
    this.physics.world.pause();
    const options = this.progressionSystem.pickLevelUpOptions(this.playerState);
    eventBus.emit("levelup:shown", { options });
  }

  /**
   * @date 2026-04-24
   * @desc ?좏깮???덈꺼???듭뀡????ν븯怨??λ젰移섎? 媛깆떊?쒕떎.
   */
  private applyLevelUpSelection(selectedOption: LevelUpOption) {
    if (!this.isLevelUpOpen) {
      return;
    }

    this.selectedOptions.push(selectedOption.name);
    this.progressionSystem.applyLevelUp(this.playerState, selectedOption);
    this.isLevelUpOpen = false;
    this.physics.world.resume();
    this.emitPlayerStatsUpdated();
    eventBus.emit("levelup:closed", undefined);
  }

  /**
   * @date 2026-04-24
   * @desc 보스 등장 시간이 되면 스테이지 안에서 경고 후 보스를 스폰한다.
   */
  private handleBossTrigger() {
    if (this.bossPhase > FINAL_BOSS_PHASE || this.hasActiveBoss()) {
      return;
    }

    if (this.isBossWarningActive) {
      if (this.time.now >= this.bossWarningUntilTimestamp) {
        this.spawnStageBoss();
      }
      return;
    }

    if (this.getSurvivalElapsedMs() < this.nextBossTriggerElapsedMs) {
      return;
    }

    this.startBossWarning();
  }

  /**
   * @date 2026-04-28
   * @desc 현재 스테이지에 살아있는 보스가 있는지 확인한다.
   */
  private hasActiveBoss() {
    return this.monsters.some((monster) => {
      return monster.active && Boolean(monster.getData("isBoss"));
    });
  }

  /**
   * @date 2026-04-28
   * @desc 보스 등장 전 경고 문구를 표시하고 주변 몬스터를 밀어낸다.
   */
  private startBossWarning() {
    this.isBossWarningActive = true;
    this.bossWarningUntilTimestamp = this.time.now + BOSS_WARNING_DURATION_MS;
    this.pushNearbyMonstersForBossSpawn();

    this.bossWarningText?.destroy();
    this.bossWarningText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 160, `WARNING: Boss ${this.bossPhase}`, {
        fontSize: "38px",
        color: "#fca5a5",
        stroke: "#450a0a",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  /**
   * @date 2026-04-28
   * @desc 보스 등장 연출을 위해 플레이어 주변 몬스터를 바깥쪽으로 밀어낸다.
   */
  private pushNearbyMonstersForBossSpawn() {
    this.monsters.forEach((monster) => {
      if (Boolean(monster.getData("isBoss"))) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, monster.x, monster.y);
      if (distance > BOSS_STAGE_CLEAR_RADIUS) {
        return;
      }

      const monsterBody = monster.body as Phaser.Physics.Arcade.Body;
      const deltaX = monster.x - this.player.x;
      const deltaY = monster.y - this.player.y;
      const length = Math.hypot(deltaX, deltaY) || 1;
      monsterBody.setVelocity(
        (deltaX / length) * BOSS_STAGE_PUSH_FORCE,
        (deltaY / length) * BOSS_STAGE_PUSH_FORCE,
      );
      monster.setData("knockbackUntil", this.time.now + BOSS_WARNING_DURATION_MS);
    });
  }

  /**
   * @date 2026-04-28
   * @desc 현재 보스 페이즈 데이터를 기반으로 스테이지 보스를 생성한다.
   */
  private spawnStageBoss() {
    this.isBossWarningActive = false;
    this.bossWarningText?.destroy();
    this.bossWarningText = null;

    const bossData = this.getBossData();
    const spawnPosition = this.computeBossSpawnPosition();
    const bossMonster = this.add.rectangle(
      spawnPosition.x,
      spawnPosition.y,
      BOSS_STAGE_WIDTH,
      BOSS_STAGE_HEIGHT,
      BOSS_STAGE_COLOR,
    );
    bossMonster.setDepth(BOSS_STAGE_DEPTH);
    this.physics.add.existing(bossMonster);

    const bossBody = bossMonster.body as Phaser.Physics.Arcade.Body;
    bossBody.setCollideWorldBounds(true);

    const maxHp = this.computeBossMaxHp(bossData.maxHp, this.bossPhase);
    bossMonster.setData("isBoss", true);
    bossMonster.setData("name", `Boss ${this.bossPhase}: ${bossData.name}`);
    bossMonster.setData("grade", "boss");
    bossMonster.setData("hp", maxHp);
    bossMonster.setData("maxHp", maxHp);
    bossMonster.setData("damage", bossData.damage);
    bossMonster.setData("moveSpeed", bossData.moveSpeed);
    bossMonster.setData("expReward", this.computeBossExpReward(bossData.expCoefficient, this.bossPhase));
    this.monsters.push(bossMonster);
    eventBus.emit("combat:target-updated", {
      name: `Boss ${this.bossPhase}: ${bossData.name}`,
      hp: maxHp,
      maxHp,
    });
  }

  /**
   * @date 2026-04-28
   * @desc 플레이어 주변 보스 스폰 좌표를 월드 경계 안으로 계산한다.
   */
  private computeBossSpawnPosition() {
    const angleRadian = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const rawX = this.player.x + Math.cos(angleRadian) * BOSS_STAGE_SPAWN_DISTANCE;
    const rawY = this.player.y + Math.sin(angleRadian) * BOSS_STAGE_SPAWN_DISTANCE;

    return {
      x: Phaser.Math.Clamp(rawX, BOSS_STAGE_WIDTH / 2, WORLD_WIDTH - BOSS_STAGE_WIDTH / 2),
      y: Phaser.Math.Clamp(rawY, BOSS_STAGE_HEIGHT / 2, WORLD_HEIGHT - BOSS_STAGE_HEIGHT / 2),
    };
  }

  /**
   * @date 2026-04-28
   * @desc 보스 데이터가 없을 때 기본값을 포함한 보스 데이터를 반환한다.
   */
  private getBossData(): BossData {
    const bossData = bosses[0] as Partial<BossData> | undefined;
    return {
      name: String(bossData?.name ?? "Boss"),
      maxHp: Number(bossData?.maxHp ?? BOSS_DEFAULT_MAX_HP),
      damage: Number(bossData?.damage ?? 12),
      moveSpeed: Number(bossData?.moveSpeed ?? 90),
      expCoefficient: Number(bossData?.expCoefficient ?? BOSS_DEFAULT_EXP_COEFFICIENT),
    };
  }

  /**
   * @date 2026-04-28
   * @desc 보스 페이즈에 따른 최대 체력을 계산한다.
   */
  private computeBossMaxHp(baseBossHp: number, bossPhase: number) {
    return baseBossHp + (bossPhase - 1) * BOSS_PHASE_HP_INCREMENT;
  }

  /**
   * @date 2026-04-28
   * @desc 보스 계수와 페이즈 성장률을 반영해 처치 경험치를 계산한다.
   */
  private computeBossExpReward(expCoefficient: number, bossPhase: number) {
    const phaseMultiplier = 1 + (bossPhase - 1) * BOSS_PHASE_EXP_GROWTH_RATE;
    return Math.max(1, Math.round(BASE_EXP_REWARD * expCoefficient * phaseMultiplier));
  }

  /**
   * @date 2026-04-28
   * @desc 보스 처치 결과를 반영해 다음 보스를 예약하거나 클리어 처리한다.
   */
  private handleBossDefeated() {
    eventBus.emit("combat:target-updated", null);
    if (this.bossPhase >= FINAL_BOSS_PHASE) {
      this.scene.start("ResultScene", { result: "clear" });
      return;
    }

    this.bossPhase += 1;
    this.nextBossTriggerElapsedMs += BOSS_REAPPEAR_INTERVAL_MS;
  }

  /**
   * @date 2026-04-24
   * @desc ?꾩옱 ?곗쓽 ?꾩쟻 ?앹〈 ?쒓컙??諛由ъ큹 ?⑥쐞濡?怨꾩궛?쒕떎.
   */
  private getSurvivalElapsedMs() {
    return this.survivalElapsedOffsetMs + (this.time.now - this.survivalStartTimestamp);
  }

  /**
   * @date 2026-04-24
   * @desc ?꾩쟻 ?앹〈 ?쒓컙???붾㈃ ?곷떒 以묒븰 ?띿뒪?몃줈 ?쒖떆?쒕떎.
   */
  private updateTimerText() {
    const survivalSecond = Math.floor(this.getSurvivalElapsedMs() / 1000);
    this.timerText.setText(`${STAGE_SURVIVAL_TIME_LABEL_TEXT} ${survivalSecond}s`);
  }

  /**
   * @date 2026-04-27
   * @desc 미니맵 플레이어 마커와 현재 구간 라벨을 현재 좌표 기준으로 갱신한다.
   */
  private updateMinimapMarkerAndRegion() {
    const playerPoint = this.toMinimapPoint(this.player.x, this.player.y);
    this.minimapMarker.x = playerPoint.x;
    this.minimapMarker.y = playerPoint.y;
    this.regionText.setText(`${STAGE_REGION_LABEL_TEXT}: ${this.getCurrentRegionLabel()}`);
    this.updateMinimapEnemyMarkers();
    this.updateMinimapExpMarkers();
  }

  /**
   * @date 2026-04-28
   * @desc 월드 좌표를 미니맵 내부 좌표로 변환한다.
   */
  private toMinimapPoint(worldX: number, worldY: number) {
    const ratioX = Phaser.Math.Clamp(worldX / WORLD_WIDTH, 0, 1);
    const ratioY = Phaser.Math.Clamp(worldY / WORLD_HEIGHT, 0, 1);
    return {
      x: STAGE_MINIMAP_X + ratioX * STAGE_MINIMAP_WIDTH,
      y: STAGE_MINIMAP_Y + ratioY * STAGE_MINIMAP_HEIGHT,
    };
  }

  /**
   * @date 2026-04-28
   * @desc 적과 보스의 월드 좌표를 미니맵 마커로 갱신한다.
   */
  private updateMinimapEnemyMarkers() {
    const markerPoints = this.monsters
      .filter((monster) => {
        return monster.active && this.isInMinimapObjectVisibleRadius(monster.x, monster.y);
      })
      .map((monster): MinimapPoint => {
        const point = this.toMinimapPoint(monster.x, monster.y);
        const isBoss = Boolean(monster.getData("isBoss"));
        const isElite = monster.getData("grade") === "elite";
        if (isBoss) {
          return {
            ...point,
            radius: STAGE_MINIMAP_BOSS_MARKER_RADIUS,
            color: STAGE_MINIMAP_BOSS_MARKER_COLOR,
          };
        }

        if (isElite) {
          return {
            ...point,
            radius: STAGE_MINIMAP_ELITE_MARKER_RADIUS,
            color: STAGE_MINIMAP_ELITE_MARKER_COLOR,
          };
        }

        return {
          ...point,
          radius: STAGE_MINIMAP_ENEMY_MARKER_RADIUS,
          color: STAGE_MINIMAP_ENEMY_MARKER_COLOR,
        };
      });

    this.syncMinimapMarkers(this.minimapEnemyMarkers, markerPoints);
  }

  /**
   * @date 2026-04-28
   * @desc 경험치 구슬 일부를 미니맵 마커로 갱신한다.
   */
  private updateMinimapExpMarkers() {
    const visibleExpOrbs = this.expOrbs.filter((expOrb) => {
      return expOrb.active && this.isInMinimapObjectVisibleRadius(expOrb.x, expOrb.y);
    });
    const step = Math.max(1, Math.ceil(visibleExpOrbs.length / STAGE_MINIMAP_MAX_EXP_MARKERS));
    const markerPoints: MinimapPoint[] = [];

    for (let orbIndex = 0; orbIndex < visibleExpOrbs.length; orbIndex += step) {
      const expOrb = visibleExpOrbs[orbIndex];
      if (!expOrb?.active) {
        continue;
      }

      const point = this.toMinimapPoint(expOrb.x, expOrb.y);
      markerPoints.push({
        ...point,
        radius: STAGE_MINIMAP_EXP_MARKER_RADIUS,
        color: STAGE_MINIMAP_EXP_MARKER_COLOR,
      });
    }

    this.syncMinimapMarkers(this.minimapExpMarkers, markerPoints);
  }

  /**
   * @date 2026-04-28
   * @desc 플레이어 주변 미니맵 표시 반경 안에 있는 월드 좌표인지 확인한다.
   */
  private isInMinimapObjectVisibleRadius(worldX: number, worldY: number) {
    return (
      Phaser.Math.Distance.Between(this.player.x, this.player.y, worldX, worldY) <=
      STAGE_MINIMAP_OBJECT_VISIBLE_RADIUS
    );
  }

  /**
   * @date 2026-04-28
   * @desc 미니맵 마커 풀을 목표 좌표 목록에 맞춰 재사용 갱신한다.
   */
  private syncMinimapMarkers(
    markerPool: Phaser.GameObjects.Arc[],
    markerPoints: MinimapPoint[],
  ) {
    while (markerPool.length < markerPoints.length) {
      const marker = this.add.circle(0, 0, 1, 0xffffff);
      marker.setScrollFactor(0);
      marker.setDepth(90);
      markerPool.push(marker);
    }

    markerPool.forEach((marker, markerIndex) => {
      const markerPoint = markerPoints[markerIndex];
      if (!markerPoint) {
        marker.setVisible(false);
        return;
      }

      marker.setVisible(true);
      marker.setPosition(markerPoint.x, markerPoint.y);
      marker.setRadius(markerPoint.radius);
      marker.setFillStyle(markerPoint.color, 1);
    });
  }

  /**
   * @date 2026-04-27
   * @desc 플레이어 월드 좌표를 구간 라벨(A-1 형식)로 변환한다.
   */
  private getCurrentRegionLabel() {
    const columnIndex = this.toRegionIndex(this.player.x, WORLD_WIDTH, WORLD_REGION_COLUMNS);
    const rowIndex = this.toRegionIndex(this.player.y, WORLD_HEIGHT, WORLD_REGION_ROWS);
    const columnLabel = String.fromCharCode(65 + columnIndex);
    const rowLabel = String(rowIndex + 1);
    return `${columnLabel}-${rowLabel}`;
  }

  /**
   * @date 2026-04-27
   * @desc 좌표를 전체 길이 대비 구간 인덱스로 안전하게 변환한다.
   */
  private toRegionIndex(position: number, totalSize: number, regionCount: number) {
    const normalized = Phaser.Math.Clamp(position / totalSize, 0, 0.999999);
    return Math.floor(normalized * regionCount);
  }

  /**
   * @date 2026-04-24
   * @desc ?붾㈃ ?섎떒??寃쏀뿕移?諛붿? ?섏튂 ?띿뒪?몃? ?앹꽦?쒕떎.
   */
  private createExpBar() {
    const expBarWidth = GAME_WIDTH - STAGE_EXP_BAR_HORIZONTAL_PADDING * 2;
    const expBarX = STAGE_EXP_BAR_HORIZONTAL_PADDING;
    const expBarY = GAME_HEIGHT - STAGE_EXP_BAR_BOTTOM_OFFSET;

    this.expBarBackground = this.add.rectangle(
      expBarX,
      expBarY,
      expBarWidth,
      STAGE_EXP_BAR_HEIGHT,
      STAGE_EXP_BAR_BACKGROUND_COLOR,
    );
    this.expBarBackground.setOrigin(0, 0.5);
    this.expBarBackground.setStrokeStyle(STAGE_EXP_BAR_STROKE_WIDTH, STAGE_EXP_BAR_STROKE_COLOR);
    this.expBarBackground.setScrollFactor(0);

    this.expBarFill = this.add.rectangle(
      expBarX,
      expBarY,
      expBarWidth,
      STAGE_EXP_BAR_HEIGHT,
      STAGE_EXP_BAR_FILL_COLOR,
    );
    this.expBarFill.setOrigin(0, 0.5);
    this.expBarFill.setScrollFactor(0);

    this.expBarText = this.add
      .text(GAME_WIDTH / 2, expBarY - STAGE_EXP_TEXT_OFFSET_Y, "", {
        fontSize: STAGE_EXP_TEXT_FONT_SIZE,
        color: STAGE_EXP_TEXT_COLOR,
      })
      .setOrigin(STAGE_EXP_TEXT_ORIGIN_X, STAGE_EXP_TEXT_ORIGIN_Y)
      .setScrollFactor(0);
  }

  /**
   * @date 2026-04-24
   * @desc ?꾩옱 寃쏀뿕移섏? ?꾩슂 寃쏀뿕移?湲곗??쇰줈 ?섎떒 寃쏀뿕移?諛붾? 媛깆떊?쒕떎.
   */
  private updateExpBar() {
    const requiredExp = this.progressionSystem.getRequiredExp(this.playerState);
    const currentExp = Math.max(0, Math.min(requiredExp, this.playerState.exp));
    const progressRatio = requiredExp <= 0 ? 0 : currentExp / requiredExp;
    const expBarWidth = GAME_WIDTH - STAGE_EXP_BAR_HORIZONTAL_PADDING * 2;

    this.expBarFill.displayWidth = Math.max(0, expBarWidth * progressRatio);
    this.expBarText.setText(
      `${STAGE_EXP_LABEL_TEXT} ${this.playerState.exp} / ${requiredExp}  (Lv.${this.playerState.level})`,
    );
  }

  /**
   * @date 2026-04-27
   * @desc 플레이어 HP 바와 텍스트 UI를 생성한다.
   */
  private createHpBar() {
    this.hpBarBackground = this.add.rectangle(
      STAGE_HP_BAR_X,
      STAGE_HP_BAR_Y,
      STAGE_HP_BAR_WIDTH,
      STAGE_HP_BAR_HEIGHT,
      STAGE_HP_BAR_BACKGROUND_COLOR,
    );
    this.hpBarBackground.setOrigin(0, 0.5);
    this.hpBarBackground.setStrokeStyle(STAGE_HP_BAR_STROKE_WIDTH, STAGE_HP_BAR_STROKE_COLOR);
    this.hpBarBackground.setScrollFactor(0);

    this.hpBarFill = this.add.rectangle(
      STAGE_HP_BAR_X,
      STAGE_HP_BAR_Y,
      STAGE_HP_BAR_WIDTH,
      STAGE_HP_BAR_HEIGHT,
      STAGE_HP_BAR_FILL_COLOR,
    );
    this.hpBarFill.setOrigin(0, 0.5);
    this.hpBarFill.setScrollFactor(0);

    this.hpText = this.add.text(STAGE_HP_TEXT_X, STAGE_HP_TEXT_Y, "", {
      fontSize: STAGE_HP_TEXT_FONT_SIZE,
      color: STAGE_HP_TEXT_COLOR,
    });
    this.hpText.setOrigin(0, 0);
    this.hpText.setScrollFactor(0);
  }

  /**
   * @date 2026-04-27
   * @desc 현재 플레이어 HP를 바/텍스트에 반영한다.
   */
  private updatePlayerHpBar() {
    const hpRatio =
      this.playerState.maxHp <= 0
        ? 0
        : Math.max(0, Math.min(1, this.playerState.hp / this.playerState.maxHp));
    this.hpBarFill.displayWidth = Math.max(0, STAGE_HP_BAR_WIDTH * hpRatio);
    this.hpBarFill.fillColor = hpRatio <= 0.3 ? STAGE_HP_BAR_LOW_FILL_COLOR : STAGE_HP_BAR_FILL_COLOR;
    this.hpText.setText(`HP ${this.playerState.hp}/${this.playerState.maxHp}`);
  }

  /**
   * @date 2026-04-27
   * @desc 무적 상태 동안 플레이어 알파를 깜박이게 하고 종료 시 복원한다.
   */
  private updatePlayerInvulnerabilityVisual() {
    if (this.time.now >= this.playerInvulnerableUntil) {
      this.player.setAlpha(1);
      this.head.setAlpha(1);
      return;
    }

    const blinkStep = Math.floor(this.time.now / PLAYER_INVULNERABLE_BLINK_INTERVAL_MS);
    const isDimmed = blinkStep % 2 === 0;
    const alpha = isDimmed ? PLAYER_INVULNERABLE_BLINK_ALPHA : 1;
    this.player.setAlpha(alpha);
    this.head.setAlpha(alpha);
  }

  /**
   * @date 2026-04-24
   * @desc 湲곕낯 怨듦꺽 ???쒖꽑 諛⑺뼢 ?욎そ???寃??댄럺?몃? ?쒖떆?쒕떎.
   */
  private playAttackEffect() {
    const effectX = this.player.x + this.lookDirection.x * PLAYER_ATTACK_EFFECT_OFFSET_DISTANCE;
    const effectY = this.player.y + this.lookDirection.y * PLAYER_ATTACK_EFFECT_OFFSET_DISTANCE;
    const effectRotation = Math.atan2(this.lookDirection.y, this.lookDirection.x);
    const effect = this.add.rectangle(
      effectX,
      effectY,
      PLAYER_ATTACK_EFFECT_WIDTH,
      PLAYER_ATTACK_EFFECT_HEIGHT,
      0xfacc15,
    );
    effect.setAlpha(PLAYER_ATTACK_EFFECT_ALPHA);
    effect.setRotation(effectRotation);

    this.tweens.add({
      targets: effect,
      alpha: 0,
      scaleX: PLAYER_ATTACK_EFFECT_TWEEN_SCALE_X,
      scaleY: PLAYER_ATTACK_EFFECT_TWEEN_SCALE_Y,
      duration: PLAYER_ATTACK_EFFECT_DURATION_MS,
      onComplete: () => {
        effect.destroy();
      },
    });
  }

  /**
   * @date 2026-04-27
   * @desc 피격 데미지를 떠오르는 텍스트로 표시한다.
   */
  private showDamageText(
    worldX: number,
    worldY: number,
    damageValue: number,
    damageOwner: "player" | "enemy",
  ) {
    const textColor = damageOwner === "player" ? DAMAGE_TEXT_PLAYER_COLOR : DAMAGE_TEXT_ENEMY_COLOR;
    const damageText = this.add.text(worldX, worldY, `${damageValue}`, {
      fontFamily: DAMAGE_TEXT_FONT_FAMILY,
      fontSize: DAMAGE_TEXT_FONT_SIZE,
      color: textColor,
      stroke: DAMAGE_TEXT_STROKE_COLOR,
      strokeThickness: DAMAGE_TEXT_STROKE_THICKNESS,
    });
    damageText.setOrigin(0.5, 0.5);
    damageText.setScale(DAMAGE_TEXT_SCALE_FROM);

    this.tweens.add({
      targets: damageText,
      y: worldY - DAMAGE_TEXT_RISE_DISTANCE,
      alpha: 0,
      scale: DAMAGE_TEXT_SCALE_TO,
      duration: DAMAGE_TEXT_DURATION_MS,
      onComplete: () => {
        damageText.destroy();
      },
    });
  }
}
