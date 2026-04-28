import { describe, expect, it, vi } from "vitest";
import type { LevelUpOption } from "../shared/gameTypes";
import { eventBus } from "./eventBus";

describe("eventBus", () => {
  it("emit 시 등록된 핸들러가 payload를 전달받는다", () => {
    const handler = vi.fn<(payload: string) => void>();
    eventBus.on("scene:changed", handler);

    eventBus.emit("scene:changed", "Stage");

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith("Stage");
    eventBus.off("scene:changed", handler);
  });

  it("off 이후에는 핸들러가 호출되지 않는다", () => {
    const handler = vi.fn<(payload: { option: LevelUpOption }) => void>();
    const option: LevelUpOption = {
      id: "damage",
      type: "stat",
      targetId: "damage",
      name: "데미지",
      description: "자동 공격 피해량이 증가합니다.",
      currentStack: 0,
    };
    eventBus.on("levelup:selected", handler);
    eventBus.off("levelup:selected", handler);

    eventBus.emit("levelup:selected", { option });

    expect(handler).not.toHaveBeenCalled();
  });

  it("같은 이벤트에 여러 핸들러를 등록하면 모두 호출된다", () => {
    const firstHandler = vi.fn<(payload: { label: string }) => void>();
    const secondHandler = vi.fn<(payload: { label: string }) => void>();
    eventBus.on("player:direction-updated", firstHandler);
    eventBus.on("player:direction-updated", secondHandler);

    eventBus.emit("player:direction-updated", { label: "Left" });

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
    eventBus.off("player:direction-updated", firstHandler);
    eventBus.off("player:direction-updated", secondHandler);
  });

  it("핸들러가 없는 이벤트 emit은 예외 없이 무시된다", () => {
    expect(() => {
      eventBus.emit("levelup:closed", undefined);
    }).not.toThrow();
  });
});
