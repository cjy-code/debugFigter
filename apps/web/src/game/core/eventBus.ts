import type {
  KarmaElementId,
  KarmaElements,
  KarmaSelectionState,
  LevelUpOption,
  StatStacks,
} from "../shared/gameTypes";

type EventMap = {
  "scene:changed": string;
  "levelup:shown": { options: LevelUpOption[] };
  "levelup:closed": undefined;
  "levelup:selected": { option: LevelUpOption };
  "karma:options-shown": { options: KarmaElementId[]; expValue: number };
  "karma:closed": undefined;
  "karma:selected": { karmaElementId: KarmaElementId; expValue: number };
  "combat:target-updated": { name: string; hp: number; maxHp: number } | null;
  "player:direction-updated": { label: string };
  "player:stats-updated": { level: number; statStacks: StatStacks };
  "player:karma-updated": {
    karmaElements: KarmaElements;
    karmaSelection: KarmaSelectionState;
    karmaSlotText: string;
  };
  "settings:opened": { backgroundVolume: number; environmentVolume: number };
  "settings:closed": undefined;
  "settings:sound-changed": { backgroundVolume: number; environmentVolume: number };
  "settings:restart-requested": undefined;
  "run:ended": { result: "clear" | "dead" };
};

type EventHandler<T> = (payload: T) => void;

/**
 * @date 2026-04-23
 * @desc React와 Phaser 사이의 이벤트 통신을 담당한다.
 */
class EventBus {
  private readonly listeners = new Map<string, Set<EventHandler<unknown>>>();

  /**
   * @date 2026-04-23
   * @desc 특정 이벤트 타입에 핸들러를 등록한다.
   */
  on<K extends keyof EventMap>(eventName: K, handler: EventHandler<EventMap[K]>) {
    const handlers = this.listeners.get(eventName) ?? new Set<EventHandler<unknown>>();
    handlers.add(handler as EventHandler<unknown>);
    this.listeners.set(eventName, handlers);
  }

  /**
   * @date 2026-04-23
   * @desc 특정 이벤트 타입에서 핸들러를 제거한다.
   */
  off<K extends keyof EventMap>(eventName: K, handler: EventHandler<EventMap[K]>) {
    const handlers = this.listeners.get(eventName);
    if (!handlers) {
      return;
    }

    handlers.delete(handler as EventHandler<unknown>);
    if (handlers.size === 0) {
      this.listeners.delete(eventName);
    }
  }

  /**
   * @date 2026-04-23
   * @desc 이벤트를 발행하여 구독자에게 데이터를 전달한다.
   */
  emit<K extends keyof EventMap>(eventName: K, payload: EventMap[K]) {
    const handlers = this.listeners.get(eventName);
    if (!handlers) {
      return;
    }

    handlers.forEach((handler) => {
      (handler as EventHandler<EventMap[K]>)(payload);
    });
  }
}

export const eventBus = new EventBus();
