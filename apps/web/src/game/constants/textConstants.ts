/**
 * @date 2026-04-27
 * @desc 게임 전역 UI 텍스트 상수 모음이다.
 */
export const APP_TITLE_TEXT = "Debug Fighter MVP";
export const HUD_SCENE_LABEL_TEXT = "Scene";
export const HUD_DIRECTION_LABEL_TEXT = "Direction";
export const HUD_ENEMY_HP_LABEL_TEXT = "Enemy HP";
export const LEVEL_UP_TITLE_TEXT = "레벨업 선택";
export const LEVEL_UP_GUIDE_TEXT = "방향키로 이동, Enter 확정, 1/2/3 바로 선택";

export const LOBBY_START_GUIDE_TEXT = "Enter를 누르면 캐릭터 선택으로 이동합니다.";
export const LOBBY_CONTROL_GUIDE_TEXT =
  "WASD 이동 / 마우스 조준 / 화면 밖에서는 방향키 조준 / 스킬 자동 실행";
export const LOBBY_CLASS_SELECT_TITLE_TEXT = "CHARACTER SELECT";
export const LOBBY_CLASS_SELECT_GUIDE_TEXT = "1/2/3 또는 좌우로 선택, Enter 시작";

export const STAGE_SURVIVAL_TIME_LABEL_TEXT = "생존 시간";
export const STAGE_EXP_LABEL_TEXT = "EXP";
export const STAGE_REGION_LABEL_TEXT = "현재 구간";

export const BOSS_ATTACK_GUIDE_TEXT = "스킬이 자동으로 실행됩니다.";
export const BOSS_LOW_HP_GUIDE_TEXT = "마무리 일격이 필요해요!";
export const BOSS_HP_LABEL_TEXT = "보스 체력";

export const RESULT_TITLE_CLEAR_TEXT = "RUN CLEAR";
export const RESULT_TITLE_FAILED_TEXT = "RUN FAILED";
export const RESULT_RUN_COUNT_LABEL_TEXT = "누적 도전 횟수";
export const RESULT_CLEAR_COUNT_LABEL_TEXT = "클리어 횟수";
export const RESULT_BACK_TO_LOBBY_GUIDE_TEXT = "R 키로 로비 복귀";

/**
 * @date 2026-04-27
 * @desc 최종 보스 페이즈 기준으로 로비 목표 안내 문구를 생성한다.
 */
export function createLobbyGoalText(finalBossPhase: number) {
  return `목표: Boss ${finalBossPhase} 처치 후 클리어`;
}
