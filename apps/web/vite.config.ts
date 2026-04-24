import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * @date 2026-04-23
 * @desc Vite 개발 서버와 React 플러그인을 설정한다.
 */
export default defineConfig({
  plugins: [react()],
});
