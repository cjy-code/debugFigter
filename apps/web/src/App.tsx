import { useEffect, useRef, useState } from "react";
import { GAME_CONTAINER_ID } from "./game/constants/gameConstants";
import {
  APP_TITLE_TEXT,
  HUD_DIRECTION_LABEL_TEXT,
  HUD_ENEMY_HP_LABEL_TEXT,
  HUD_SCENE_LABEL_TEXT,
  LEVEL_UP_GUIDE_TEXT,
  LEVEL_UP_TITLE_TEXT,
} from "./game/constants/textConstants";
import { eventBus } from "./game/core/eventBus";
import type {
  KarmaCounts,
  KarmaId,
  LevelUpOption,
  StatStacks,
  StatUpgradeId,
} from "./game/shared/gameTypes";

type LevelUpPayload = {
  options: LevelUpOption[];
};

type TargetHpPayload = {
  name: string;
  hp: number;
  maxHp: number;
} | null;

type PlayerDirectionPayload = {
  label: string;
};

type PlayerStatsPayload = {
  level: number;
  statStacks: StatStacks;
};

type PlayerKarmaPayload = {
  karmaCounts: KarmaCounts;
};

type GameAppLike = {
  start: () => void;
  destroy: () => void;
};

const STAT_HUD_LABELS: Record<StatUpgradeId, string> = {
  attackSpeed: "공속",
  expGain: "경험치",
  attackCount: "개수",
  damage: "데미지",
  criticalChance: "치확",
  criticalDamage: "치피",
  moveSpeed: "이속",
  attackRange: "범위",
};

const STAT_HUD_ORDER: StatUpgradeId[] = [
  "attackSpeed",
  "expGain",
  "attackCount",
  "damage",
  "criticalChance",
  "criticalDamage",
  "moveSpeed",
  "attackRange",
];

const INITIAL_STAT_STACKS: StatStacks = {
  attackSpeed: 0,
  expGain: 0,
  attackCount: 0,
  damage: 0,
  criticalChance: 0,
  criticalDamage: 0,
  moveSpeed: 0,
  attackRange: 0,
};

const KARMA_HUD_LABELS: Record<KarmaId, string> = {
  fire: "불",
  water: "물",
  wind: "바람",
  rock: "바위",
  dark: "암흑",
  holy: "성스러움",
  transformShard: "조각",
};

const KARMA_HUD_ORDER: KarmaId[] = [
  "fire",
  "water",
  "wind",
  "rock",
  "dark",
  "holy",
  "transformShard",
];

const INITIAL_KARMA_COUNTS: KarmaCounts = {
  fire: 0,
  water: 0,
  wind: 0,
  rock: 0,
  dark: 0,
  holy: 0,
  transformShard: 0,
};

/**
 * @date 2026-04-27
 * @desc React HUD와 Phaser 게임 캔버스를 연결하고 오버레이 상태를 렌더링한다.
 */
export function App() {
  const gameAppRef = useRef<GameAppLike | null>(null);
  const [sceneName, setSceneName] = useState("Boot");
  const [levelUpOptions, setLevelUpOptions] = useState<LevelUpOption[]>([]);
  const [levelUpSelectedIndex, setLevelUpSelectedIndex] = useState(0);
  const [targetHpPayload, setTargetHpPayload] = useState<TargetHpPayload>(null);
  const [playerDirection, setPlayerDirection] = useState("Right");
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerStatStacks, setPlayerStatStacks] = useState<StatStacks>(INITIAL_STAT_STACKS);
  const [playerKarmaCounts, setPlayerKarmaCounts] =
    useState<KarmaCounts>(INITIAL_KARMA_COUNTS);

  useEffect(() => {
    let isMounted = true;

    /**
     * @date 2026-04-27
     * @desc GameApp을 동적 import로 지연 로드해 초기 번들 크기를 줄인다.
     */
    const bootstrapGameApp = async () => {
      const { GameApp } = await import("./game/core/GameApp");
      if (!isMounted) {
        return;
      }

      const gameApp = new GameApp(GAME_CONTAINER_ID);
      gameAppRef.current = gameApp;
      gameApp.start();
    };

    void bootstrapGameApp();

    /**
     * @date 2026-04-27
     * @desc 씬 변경 이벤트를 수신해 현재 씬 표시를 갱신한다.
     */
    const handleSceneChanged = (nextSceneName: string) => {
      setSceneName(nextSceneName);
    };

    /**
     * @date 2026-04-27
     * @desc 레벨업 선택지 이벤트를 수신해 오버레이를 연다.
     */
    const handleLevelUpShown = (payload: LevelUpPayload) => {
      setLevelUpOptions(payload.options);
      setLevelUpSelectedIndex(0);
    };

    /**
     * @date 2026-04-27
     * @desc 레벨업 오버레이 닫힘 이벤트를 수신해 상태를 초기화한다.
     */
    const handleLevelUpClosed = () => {
      setLevelUpOptions([]);
      setLevelUpSelectedIndex(0);
    };

    /**
     * @date 2026-04-27
     * @desc 타겟 HP 이벤트를 수신해 HUD 표시 정보를 갱신한다.
     */
    const handleTargetUpdated = (payload: TargetHpPayload) => {
      setTargetHpPayload(payload);
    };

    /**
     * @date 2026-04-27
     * @desc 플레이어 시선 방향 이벤트를 수신해 HUD에 반영한다.
     */
    const handleDirectionUpdated = (payload: PlayerDirectionPayload) => {
      setPlayerDirection(payload.label);
    };

    /**
     * @date 2026-04-28
     * @desc 플레이어 스탯 스택 이벤트를 수신해 HUD 표시 상태를 갱신한다.
     */
    const handleStatsUpdated = (payload: PlayerStatsPayload) => {
      setPlayerLevel(payload.level);
      setPlayerStatStacks(payload.statStacks);
    };

    /**
     * @date 2026-04-28
     * @desc 카르마 보유량 이벤트를 수신해 HUD 표시 상태를 갱신한다.
     */
    const handleKarmaUpdated = (payload: PlayerKarmaPayload) => {
      setPlayerKarmaCounts(payload.karmaCounts);
    };

    eventBus.on("scene:changed", handleSceneChanged);
    eventBus.on("levelup:shown", handleLevelUpShown);
    eventBus.on("levelup:closed", handleLevelUpClosed);
    eventBus.on("combat:target-updated", handleTargetUpdated);
    eventBus.on("player:direction-updated", handleDirectionUpdated);
    eventBus.on("player:stats-updated", handleStatsUpdated);
    eventBus.on("player:karma-updated", handleKarmaUpdated);

    return () => {
      isMounted = false;
      eventBus.off("scene:changed", handleSceneChanged);
      eventBus.off("levelup:shown", handleLevelUpShown);
      eventBus.off("levelup:closed", handleLevelUpClosed);
      eventBus.off("combat:target-updated", handleTargetUpdated);
      eventBus.off("player:direction-updated", handleDirectionUpdated);
      eventBus.off("player:stats-updated", handleStatsUpdated);
      eventBus.off("player:karma-updated", handleKarmaUpdated);
      gameAppRef.current?.destroy();
      gameAppRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (levelUpOptions.length === 0) {
      return;
    }

    /**
     * @date 2026-04-27
     * @desc 레벨업 오버레이에서 키보드 입력으로 선택 인덱스를 이동하거나 확정한다.
     */
    const handleLevelUpKeyboard = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "ArrowUp") {
        keyboardEvent.preventDefault();
        setLevelUpSelectedIndex((previousIndex) => {
          return (previousIndex - 1 + levelUpOptions.length) % levelUpOptions.length;
        });
        return;
      }

      if (keyboardEvent.key === "ArrowDown") {
        keyboardEvent.preventDefault();
        setLevelUpSelectedIndex((previousIndex) => {
          return (previousIndex + 1) % levelUpOptions.length;
        });
        return;
      }

      if (keyboardEvent.key === "1" || keyboardEvent.key === "2" || keyboardEvent.key === "3") {
        keyboardEvent.preventDefault();
        const selectedIndex = Number(keyboardEvent.key) - 1;
        if (selectedIndex < levelUpOptions.length) {
          handleSelectLevelUpOption(levelUpOptions[selectedIndex]);
        }
        return;
      }

      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        handleSelectLevelUpOption(levelUpOptions[levelUpSelectedIndex]);
      }
    };

    window.addEventListener("keydown", handleLevelUpKeyboard);
    return () => {
      window.removeEventListener("keydown", handleLevelUpKeyboard);
    };
  }, [levelUpOptions, levelUpSelectedIndex]);

  /**
   * @date 2026-04-27
   * @desc 선택한 레벨업 옵션을 Phaser로 전달하고 오버레이를 닫는다.
   */
  const handleSelectLevelUpOption = (option: LevelUpOption) => {
    eventBus.emit("levelup:selected", { option });
    setLevelUpOptions([]);
  };

  return (
    <main className="app">
      <header className="hud">
        <h1>{APP_TITLE_TEXT}</h1>
        <span className="hudItem">
          {HUD_SCENE_LABEL_TEXT}: {sceneName}
        </span>
        <span className="hudItem">
          {HUD_DIRECTION_LABEL_TEXT}: {playerDirection}
        </span>
        <span className="hudItem hudItemEnemy">
          {HUD_ENEMY_HP_LABEL_TEXT}:{" "}
          {targetHpPayload
            ? `${targetHpPayload.name} ${targetHpPayload.hp}/${targetHpPayload.maxHp}`
            : "-"}
        </span>
        <section className="statHud" aria-label="스탯 스택">
          <span className="statHudLevel">Lv.{playerLevel}</span>
          {STAT_HUD_ORDER.map((statId) => (
            <span key={statId} className="statHudItem">
              {STAT_HUD_LABELS[statId]} {playerStatStacks[statId]}
            </span>
          ))}
        </section>
        <section className="karmaHud" aria-label="카르마 보유량">
          <span className="karmaHudTitle">카르마</span>
          {KARMA_HUD_ORDER.map((karmaId) => (
            <span key={karmaId} className={`karmaHudItem karmaHudItem-${karmaId}`}>
              {KARMA_HUD_LABELS[karmaId]} {playerKarmaCounts[karmaId]}
            </span>
          ))}
        </section>
      </header>
      <section id={GAME_CONTAINER_ID} className="gameContainer" />
      {levelUpOptions.length > 0 ? (
        <section className="overlay">
          <h2>{LEVEL_UP_TITLE_TEXT}</h2>
          <p>{LEVEL_UP_GUIDE_TEXT}</p>
          <div className="options">
            {levelUpOptions.map((option, optionIndex) => (
              <button
                key={`${option.id}-${optionIndex}`}
                type="button"
                onClick={() => handleSelectLevelUpOption(option)}
                className={optionIndex === levelUpSelectedIndex ? "isSelected" : ""}
              >
                {option.name} (스택 {option.currentStack ?? 0})
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
