import { defineConfig } from "vitest/config";

/**
 * @date 2026-04-27
 * @desc 시스템 단위 테스트 실행 환경과 테스트 파일 패턴을 설정한다.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
