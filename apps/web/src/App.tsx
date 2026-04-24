import { useEffect, useMemo, useState } from "react";
import { GameApp } from "./game/core/GameApp";
import { eventBus } from "./game/core/eventBus";
import { GAME_CONTAINER_ID } from "./game/constants/gameConstants";

type LevelUpPayload = {
  options: string[];
};

type TargetHpPayload = {
  name: string;
  hp: number;
  maxHp: number;
} | null;

type PlayerDirectionPayload = {
  label: string;
};

/**
 * @date 2026-04-23
 * @desc React UI와 Phaser 게임 캔버스를 연결하고 오버레이를 렌더링한다.
 */
export function App() {
  const gameApp = useMemo(() => new GameApp(GAME_CONTAINER_ID), []);
  const [sceneName, setSceneName] = useState("Boot");
  const [levelUpOptions, setLevelUpOptions] = useState<string[]>([]);
  const [levelUpSelectedIndex, setLevelUpSelectedIndex] = useState(0);
  const [targetHpPayload, setTargetHpPayload] = useState<TargetHpPayload>(null);
  const [playerDirection, setPlayerDirection] = useState("Right");

  useEffect(() => {
    gameApp.start();

    /**
     * @date 2026-04-23
     * @desc 씬 전환 이벤트를 받아 현재 씬 텍스트를 갱신한다.
     */
    const handleSceneChanged = (nextSceneName: string) => {
      setSceneName(nextSceneName);
    };

    /**
     * @date 2026-04-23
     * @desc 레벨업 선택지 표시 이벤트를 받아 오버레이를 연다.
     */
    const handleLevelUpShown = (payload: LevelUpPayload) => {
      setLevelUpOptions(payload.options);
      setLevelUpSelectedIndex(0);
    };

    /**
     * @date 2026-04-23
     * @desc 레벨업 오버레이 닫기 이벤트를 처리한다.
     */
    const handleLevelUpClosed = () => {
      setLevelUpOptions([]);
      setLevelUpSelectedIndex(0);
    };

    /**
     * @date 2026-04-24
     * @desc 타격된 적의 HP 정보를 헤더 상태로 갱신한다.
     */
    const handleTargetUpdated = (payload: TargetHpPayload) => {
      setTargetHpPayload(payload);
    };

    /**
     * @date 2026-04-24
     * @desc 플레이어 시선 방향 표기를 헤더 상태로 갱신한다.
     */
    const handleDirectionUpdated = (payload: PlayerDirectionPayload) => {
      setPlayerDirection(payload.label);
    };

    eventBus.on("scene:changed", handleSceneChanged);
    eventBus.on("levelup:shown", handleLevelUpShown);
    eventBus.on("levelup:closed", handleLevelUpClosed);
    eventBus.on("combat:target-updated", handleTargetUpdated);
    eventBus.on("player:direction-updated", handleDirectionUpdated);

    return () => {
      eventBus.off("scene:changed", handleSceneChanged);
      eventBus.off("levelup:shown", handleLevelUpShown);
      eventBus.off("levelup:closed", handleLevelUpClosed);
      eventBus.off("combat:target-updated", handleTargetUpdated);
      eventBus.off("player:direction-updated", handleDirectionUpdated);
      gameApp.destroy();
    };
  }, [gameApp]);

  useEffect(() => {
    if (levelUpOptions.length === 0) {
      return;
    }

    /**
     * @date 2026-04-24
     * @desc 레벨업 오버레이에서 키보드 입력으로 선택 인덱스와 확정을 처리한다.
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
   * @date 2026-04-23
   * @desc 레벨업 옵션 버튼 클릭 시 Phaser로 선택 이벤트를 전달한다.
   */
  const handleSelectLevelUpOption = (optionName: string) => {
    eventBus.emit("levelup:selected", { optionName });
    setLevelUpOptions([]);
  };

  return (
    <main className="app">
      <header className="hud">
        <h1>Debug Fighter MVP</h1>
        <span className="hudItem">Scene: {sceneName}</span>
        <span className="hudItem">Direction: {playerDirection}</span>
        <span className="hudItem hudItemEnemy">
          Enemy HP:{" "}
          {targetHpPayload
            ? `${targetHpPayload.name} ${targetHpPayload.hp}/${targetHpPayload.maxHp}`
            : "-"}
        </span>
      </header>
      <section id={GAME_CONTAINER_ID} className="gameContainer" />
      {levelUpOptions.length > 0 ? (
        <section className="overlay">
          <h2>레벨업 선택</h2>
          <p>↑/↓ 이동, Enter 확정, 1/2/3 바로 선택</p>
          <div className="options">
            {levelUpOptions.map((optionName, optionIndex) => (
              <button
                key={`${optionName}-${optionIndex}`}
                type="button"
                onClick={() => handleSelectLevelUpOption(optionName)}
                className={optionIndex === levelUpSelectedIndex ? "isSelected" : ""}
              >
                {optionName}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
