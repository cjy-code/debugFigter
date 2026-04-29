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
  KarmaElementId,
  KarmaElements,
  KarmaSelectionState,
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
  karmaElements: KarmaElements;
  karmaSelection: KarmaSelectionState;
  karmaSlotText: string;
};

type KarmaOptionsPayload = {
  options: KarmaElementId[];
  expValue: number;
};

type SettingsPayload = {
  backgroundVolume: number;
  environmentVolume: number;
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

const KARMA_HUD_LABELS: Record<KarmaElementId, string> = {
  fire: "불꽃",
  electric: "전기",
  rock: "바위",
};

const KARMA_HUD_ORDER: KarmaElementId[] = ["fire", "electric", "rock"];

const INITIAL_KARMA_ELEMENTS: KarmaElements = {
  fire: {
    id: "fire",
    level: 1,
    exp: 0,
    requiredExp: 3,
    damageMultiplier: 1,
    count: 1,
    range: 120,
    hitboxRadius: 48,
  },
  electric: {
    id: "electric",
    level: 1,
    exp: 0,
    requiredExp: 3,
    damageMultiplier: 0.8,
    count: 2,
    range: 180,
    hitboxRadius: 160,
  },
  rock: {
    id: "rock",
    level: 1,
    exp: 0,
    requiredExp: 3,
    damageMultiplier: 0.9,
    count: 1,
    range: 62,
    hitboxRadius: 18,
  },
};

const INITIAL_KARMA_SELECTION: KarmaSelectionState = {
  selectedElementIds: [],
  maxSelectedElementCount: 3,
  pendingOptions: [],
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
  const [karmaOptions, setKarmaOptions] = useState<KarmaElementId[]>([]);
  const [karmaOptionExpValue, setKarmaOptionExpValue] = useState(1);
  const [karmaSelectedIndex, setKarmaSelectedIndex] = useState(0);
  const [targetHpPayload, setTargetHpPayload] = useState<TargetHpPayload>(null);
  const [playerDirection, setPlayerDirection] = useState("Right");
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerStatStacks, setPlayerStatStacks] = useState<StatStacks>(INITIAL_STAT_STACKS);
  const [playerKarmaElements, setPlayerKarmaElements] =
    useState<KarmaElements>(INITIAL_KARMA_ELEMENTS);
  const [playerKarmaSelection, setPlayerKarmaSelection] =
    useState<KarmaSelectionState>(INITIAL_KARMA_SELECTION);
  const [karmaSlotText, setKarmaSlotText] = useState("0/3");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backgroundVolume, setBackgroundVolume] = useState(0.45);
  const [environmentVolume, setEnvironmentVolume] = useState(0.65);

  useEffect(() => {
    let isMounted = true;

    /**
     * @date 2026-04-27
     * @desc GameApp을 동적 import로 로드해 초기 번들 크기를 줄인다.
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
     * @date 2026-04-29
     * @desc 카르마 선택지 이벤트를 수신해 오버레이를 연다.
     */
    const handleKarmaOptionsShown = (payload: KarmaOptionsPayload) => {
      setKarmaOptions(payload.options);
      setKarmaOptionExpValue(payload.expValue);
      setKarmaSelectedIndex(0);
    };

    /**
     * @date 2026-04-29
     * @desc 카르마 선택 오버레이를 닫고 선택 상태를 초기화한다.
     */
    const handleKarmaClosed = () => {
      setKarmaOptions([]);
      setKarmaSelectedIndex(0);
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
     * @date 2026-04-29
     * @desc 카르마 성장 상태 이벤트를 수신해 HUD 표시 상태를 갱신한다.
     */
    const handleKarmaUpdated = (payload: PlayerKarmaPayload) => {
      setPlayerKarmaElements(payload.karmaElements);
      setPlayerKarmaSelection(payload.karmaSelection);
      setKarmaSlotText(payload.karmaSlotText);
    };

    /**
     * @date 2026-04-29
     * @desc Phaser 설정창 열림 이벤트를 받아 React 설정 오버레이를 표시한다.
     */
    const handleSettingsOpened = (payload: SettingsPayload) => {
      setBackgroundVolume(payload.backgroundVolume);
      setEnvironmentVolume(payload.environmentVolume);
      setIsSettingsOpen(true);
    };

    /**
     * @date 2026-04-29
     * @desc Phaser 설정창 닫힘 이벤트를 받아 React 설정 오버레이를 숨긴다.
     */
    const handleSettingsClosed = () => {
      setIsSettingsOpen(false);
    };

    eventBus.on("scene:changed", handleSceneChanged);
    eventBus.on("levelup:shown", handleLevelUpShown);
    eventBus.on("levelup:closed", handleLevelUpClosed);
    eventBus.on("karma:options-shown", handleKarmaOptionsShown);
    eventBus.on("karma:closed", handleKarmaClosed);
    eventBus.on("combat:target-updated", handleTargetUpdated);
    eventBus.on("player:direction-updated", handleDirectionUpdated);
    eventBus.on("player:stats-updated", handleStatsUpdated);
    eventBus.on("player:karma-updated", handleKarmaUpdated);
    eventBus.on("settings:opened", handleSettingsOpened);
    eventBus.on("settings:closed", handleSettingsClosed);

    return () => {
      isMounted = false;
      eventBus.off("scene:changed", handleSceneChanged);
      eventBus.off("levelup:shown", handleLevelUpShown);
      eventBus.off("levelup:closed", handleLevelUpClosed);
      eventBus.off("karma:options-shown", handleKarmaOptionsShown);
      eventBus.off("karma:closed", handleKarmaClosed);
      eventBus.off("combat:target-updated", handleTargetUpdated);
      eventBus.off("player:direction-updated", handleDirectionUpdated);
      eventBus.off("player:stats-updated", handleStatsUpdated);
      eventBus.off("player:karma-updated", handleKarmaUpdated);
      eventBus.off("settings:opened", handleSettingsOpened);
      eventBus.off("settings:closed", handleSettingsClosed);
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

  useEffect(() => {
    if (karmaOptions.length === 0) {
      return;
    }

    /**
     * @date 2026-04-29
     * @desc 카르마 선택 오버레이에서 키보드 입력으로 선택 인덱스를 이동하거나 확정한다.
     */
    const handleKarmaKeyboard = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "ArrowUp" || keyboardEvent.key === "ArrowLeft") {
        keyboardEvent.preventDefault();
        setKarmaSelectedIndex((previousIndex) => {
          return (previousIndex - 1 + karmaOptions.length) % karmaOptions.length;
        });
        return;
      }

      if (keyboardEvent.key === "ArrowDown" || keyboardEvent.key === "ArrowRight") {
        keyboardEvent.preventDefault();
        setKarmaSelectedIndex((previousIndex) => {
          return (previousIndex + 1) % karmaOptions.length;
        });
        return;
      }

      if (keyboardEvent.key === "1" || keyboardEvent.key === "2" || keyboardEvent.key === "3") {
        keyboardEvent.preventDefault();
        const selectedIndex = Number(keyboardEvent.key) - 1;
        if (selectedIndex < karmaOptions.length) {
          handleSelectKarmaOption(karmaOptions[selectedIndex]);
        }
        return;
      }

      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        handleSelectKarmaOption(karmaOptions[karmaSelectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKarmaKeyboard);
    return () => {
      window.removeEventListener("keydown", handleKarmaKeyboard);
    };
  }, [karmaOptions, karmaSelectedIndex, karmaOptionExpValue]);

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    /**
     * @date 2026-04-29
     * @desc 설정창이 열린 상태에서 ESC 키로 설정창을 닫는다.
     */
    const handleSettingsKeyboard = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== "Escape") {
        return;
      }

      keyboardEvent.preventDefault();
      handleCloseSettings();
    };

    window.addEventListener("keydown", handleSettingsKeyboard);
    return () => {
      window.removeEventListener("keydown", handleSettingsKeyboard);
    };
  }, [isSettingsOpen]);

  /**
   * @date 2026-04-27
   * @desc 선택한 레벨업 옵션을 Phaser로 전달하고 오버레이를 닫는다.
   */
  const handleSelectLevelUpOption = (option: LevelUpOption) => {
    eventBus.emit("levelup:selected", { option });
    setLevelUpOptions([]);
  };

  /**
   * @date 2026-04-29
   * @desc 선택한 카르마 옵션을 Phaser로 전달하고 오버레이를 닫는다.
   */
  const handleSelectKarmaOption = (karmaElementId: KarmaElementId) => {
    eventBus.emit("karma:selected", { karmaElementId, expValue: karmaOptionExpValue });
    setKarmaOptions([]);
  };

  /**
   * @date 2026-04-29
   * @desc 설정창을 닫고 Phaser 전투 화면을 재개한다.
   */
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    eventBus.emit("settings:closed", undefined);
  };

  /**
   * @date 2026-04-29
   * @desc 배경음 볼륨 변경값을 React 상태와 Phaser 사운드에 반영한다.
   */
  const handleChangeBackgroundVolume = (nextVolume: number) => {
    setBackgroundVolume(nextVolume);
    eventBus.emit("settings:sound-changed", {
      backgroundVolume: nextVolume,
      environmentVolume,
    });
  };

  /**
   * @date 2026-04-29
   * @desc 환경음 볼륨 변경값을 React 상태와 Phaser 사운드에 반영한다.
   */
  const handleChangeEnvironmentVolume = (nextVolume: number) => {
    setEnvironmentVolume(nextVolume);
    eventBus.emit("settings:sound-changed", {
      backgroundVolume,
      environmentVolume: nextVolume,
    });
  };

  /**
   * @date 2026-04-29
   * @desc 설정창에서 현재 전투 재시작을 요청한다.
   */
  const handleRestartStage = () => {
    setIsSettingsOpen(false);
    eventBus.emit("settings:restart-requested", undefined);
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
        <section className="karmaBuildHud" aria-label="카르마 선택">
          <span>카르마 슬롯 {karmaSlotText}</span>
          <span>
            선택 {playerKarmaSelection.selectedElementIds
              .map((karmaElementId) => KARMA_HUD_LABELS[karmaElementId])
              .join(" / ") || "-"}
          </span>
        </section>
        <section className="karmaHud" aria-label="카르마 성장">
          <span className="karmaHudTitle">카르마</span>
          {KARMA_HUD_ORDER.map((karmaElementId) => {
            const karmaElement = playerKarmaElements[karmaElementId];
            return (
              <span
                key={karmaElementId}
                className={`karmaHudItem karmaHudItem-${karmaElementId}`}
              >
                {KARMA_HUD_LABELS[karmaElementId]} Lv.{karmaElement.level}{" "}
                {karmaElement.exp}/{karmaElement.requiredExp}
              </span>
            );
          })}
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
      {karmaOptions.length > 0 ? (
        <section className="overlay">
          <h2>카르마 선택</h2>
          <p>획득할 카르마 속성을 선택합니다. EXP +{karmaOptionExpValue}</p>
          <div className="options">
            {karmaOptions.map((karmaElementId, optionIndex) => (
              <button
                key={`${karmaElementId}-${optionIndex}`}
                type="button"
                onClick={() => handleSelectKarmaOption(karmaElementId)}
                className={optionIndex === karmaSelectedIndex ? "isSelected" : ""}
              >
                {KARMA_HUD_LABELS[karmaElementId]}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {isSettingsOpen ? (
        <section className="overlay settingsOverlay">
          <div className="settingsPanel">
            <h2>설정</h2>
            <label className="settingsControl">
              <span>배경음 {Math.round(backgroundVolume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={backgroundVolume}
                onChange={(event) => handleChangeBackgroundVolume(Number(event.target.value))}
              />
            </label>
            <label className="settingsControl">
              <span>환경음 {Math.round(environmentVolume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={environmentVolume}
                onChange={(event) => handleChangeEnvironmentVolume(Number(event.target.value))}
              />
            </label>
            <div className="settingsActions">
              <button type="button" onClick={handleRestartStage}>
                재시작
              </button>
              <button type="button" onClick={handleCloseSettings}>
                닫기
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
