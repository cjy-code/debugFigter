import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * @date 2026-04-27
 * @desc Vite 빌드에서 React/Phaser 청크를 분리해 초기 로딩 부담을 줄인다.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf("node_modules/phaser") >= 0) {
            return "vendor-phaser";
          }

          if (id.indexOf("node_modules/react") >= 0 || id.indexOf("node_modules/react-dom") >= 0) {
            return "vendor-react";
          }

          if (id.indexOf("/src/game/") >= 0) {
            return "game-runtime";
          }

          return undefined;
        },
      },
    },
  },
});
