import Phaser from "phaser";
import {
  BOSS_APPEAR_INTERVAL_MS,
  DEFAULT_PLAYER_CLASS_TYPE,
  GAME_HEIGHT,
  GAME_WIDTH,
  INITIAL_MONSTER_SPAWN_DELAY_MS,
  LOOK_POINTER_MIN_DISTANCE,
  LOOK_DIRECTION_SMOOTHING_FACTOR,
  MONSTER_SPAWN_INTERVAL_MS,
  MONSTER_SPEED,
  MONSTER_KNOCKBACK_DURATION_MS,
  MONSTER_KNOCKBACK_FORCE,
  PLAYER_ATTACK_EFFECT_ALPHA,
  PLAYER_ATTACK_EFFECT_DURATION_MS,
  PLAYER_ATTACK_EFFECT_HEIGHT,
  PLAYER_ATTACK_EFFECT_OFFSET_DISTANCE,
  PLAYER_ATTACK_EFFECT_TWEEN_SCALE_X,
  PLAYER_ATTACK_EFFECT_TWEEN_SCALE_Y,
  PLAYER_ATTACK_EFFECT_WIDTH,
  PLAYER_ATTACK_COOLDOWN_MS,
  PLAYER_ATTACK_TARGET_DOT_THRESHOLD,
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
  PLAYER_SPEED,
  PLAYER_WIDTH,
  PLAYER_IDLE_ANIMATION_KEY_BY_CLASS,
  PLAYER_IDLE_TEXTURE_KEY_BY_CLASS,
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
  STAGE_MINIMAP_GRID_COLOR,
  STAGE_MINIMAP_HEIGHT,
  STAGE_MINIMAP_MARKER_COLOR,
  STAGE_MINIMAP_MARKER_RADIUS,
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
import { CombatSystem } from "../systems/CombatSystem";
import { ProgressionSystem } from "../systems/ProgressionSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { SynergySystem } from "../systems/SynergySystem";
import type { PlayerClassType, PlayerState } from "../shared/gameTypes";

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
  private minimapBackground!: Phaser.GameObjects.Rectangle;
  private minimapMarker!: Phaser.GameObjects.Arc;
  private minimapGridLines: Phaser.GameObjects.Line[] = [];
  private moveKeys!: MoveKeys;
  private lookKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private monsters: Phaser.GameObjects.Rectangle[] = [];
  private nextSpawnTimestamp = 0;
  private nextPlayerHitTimestamp = 0;
  private attackCooldownTimestamp = 0;
  private playerInvulnerableUntil = 0;
  private playerKnockbackUntil = 0;
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
  private readonly playerState: PlayerState = createInitialPlayerState(DEFAULT_PLAYER_CLASS_TYPE);
  private readonly selectedOptions: string[] = [];
  private readonly handleLevelUpSelected = (payload: { optionName: string }) => {
    this.applyLevelUpSelection(payload.optionName);
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
    this.nextPlayerHitTimestamp = this.time.now;
    this.attackCooldownTimestamp = this.time.now;
    this.playerInvulnerableUntil = this.time.now;
    this.playerKnockbackUntil = this.time.now;
    this.survivalStartTimestamp = this.time.now;
    this.isLevelUpOpen = false;
    this.monsters = [];

    this.applyInitData();
    this.configureWorldAndCamera();
    this.createParallaxLayers();

    const playerTextureKey = PLAYER_IDLE_TEXTURE_KEY_BY_CLASS[this.playerState.classType];
    const playerAnimationKey = PLAYER_IDLE_ANIMATION_KEY_BY_CLASS[this.playerState.classType];
    this.player = this.physics.add.sprite(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      playerTextureKey,
    );
    this.player.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
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
    this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
    this.handleAttack();
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
      this.playerState.classType = initialPlayerState.classType;
      this.playerState.level = initialPlayerState.level;
      this.playerState.exp = initialPlayerState.exp;
      this.playerState.maxHp = initialPlayerState.maxHp;
      this.playerState.hp = initialPlayerState.hp;
      this.playerState.damage = initialPlayerState.damage;
      this.playerState.attackRange = initialPlayerState.attackRange;
      this.selectedOptions.length = 0;
      this.survivalElapsedOffsetMs = 0;
      this.nextBossTriggerElapsedMs = BOSS_APPEAR_INTERVAL_MS;
      this.bossPhase = 1;
      this.lookDirection.set(1, 0);
      this.targetLookDirection.set(1, 0);
      this.lastDirectionLabel = "Right";
      return;
    }

    this.playerState.classType = this.initData.playerState.classType;
    this.playerState.level = this.initData.playerState.level;
    this.playerState.exp = this.initData.playerState.exp;
    this.playerState.maxHp = this.initData.playerState.maxHp;
    this.playerState.hp = this.initData.playerState.hp;
    this.playerState.damage = this.initData.playerState.damage;
    this.playerState.attackRange = this.initData.playerState.attackRange;
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
   * @desc 怨듦꺽 ?낅젰 ???쒖꽑 諛⑺뼢 ?꾨갑 紐ъ뒪?곗뿉寃??쇳빐瑜??곸슜?쒕떎.
   */
  private handleAttack() {
    if (!Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      return;
    }

    if (this.time.now < this.attackCooldownTimestamp) {
      return;
    }

    this.attackCooldownTimestamp = this.time.now + PLAYER_ATTACK_COOLDOWN_MS;
    this.playAttackEffect();

    const targetMonster = this.findAttackTarget(this.playerState.attackRange);
    if (!targetMonster) {
      return;
    }

    const currentHp = Number(targetMonster.getData("hp") ?? 0);
    const maxHp = Number(targetMonster.getData("maxHp") ?? currentHp);
    const targetName = String(targetMonster.getData("name") ?? "Monster");
    const synergy = this.synergySystem.evaluate(this.selectedOptions);
    const dealtDamage = this.playerState.damage + synergy.bonusDamage;
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
      this.progressionSystem.grantExp(this.playerState, expReward);
      targetMonster.destroy();
      this.monsters = this.monsters.filter((monster) => monster.active);
    }
  }

  /**
   * @date 2026-04-24
   * @desc ?쒖꽑 諛⑺뼢 ?욎そ???덈뒗 怨듦꺽 ??곸쓣 ?먯깋?쒕떎.
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
        if (directionDot < PLAYER_ATTACK_TARGET_DOT_THRESHOLD) {
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
   * @desc 二쇨린?곸쑝濡?紐ъ뒪?곕? ?앹꽦?쒕떎.
   */
  private spawnMonstersIfNeeded() {
    if (this.time.now < this.nextSpawnTimestamp) {
      return;
    }

    this.nextSpawnTimestamp = this.time.now + MONSTER_SPAWN_INTERVAL_MS;
    const monster = this.spawnSystem.spawnMonster(this, this.player.x, this.player.y);
    this.monsters.push(monster);
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
    const options = this.progressionSystem.pickLevelUpOptions();
    eventBus.emit("levelup:shown", { options });
  }

  /**
   * @date 2026-04-24
   * @desc ?좏깮???덈꺼???듭뀡????ν븯怨??λ젰移섎? 媛깆떊?쒕떎.
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
   * @desc ?앹〈 ?꾩쟻 ?쒓컙??蹂댁뒪 援ш컙???꾨떖?섎㈃ 蹂댁뒪 ?ъ쑝濡??꾪솚?쒕떎.
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
    const ratioX = Phaser.Math.Clamp(this.player.x / WORLD_WIDTH, 0, 1);
    const ratioY = Phaser.Math.Clamp(this.player.y / WORLD_HEIGHT, 0, 1);
    this.minimapMarker.x = STAGE_MINIMAP_X + ratioX * STAGE_MINIMAP_WIDTH;
    this.minimapMarker.y = STAGE_MINIMAP_Y + ratioY * STAGE_MINIMAP_HEIGHT;
    this.regionText.setText(`${STAGE_REGION_LABEL_TEXT}: ${this.getCurrentRegionLabel()}`);
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
