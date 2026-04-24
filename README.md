# debugFigter

디버깅 감각을 게임 플레이로 익히는 웹 기반 로그라이크 프로젝트입니다.
현재 프론트엔드(`apps/web`)는 React + TypeScript + Phaser 기반으로 구성되어 있습니다.

## 기술 스택
- React 18
- TypeScript 5
- Phaser 3
- Vite 5

## 프로젝트 구조
```text
apps/
  web/
    src/
      game/
        constants/
        core/
        data/
        scenes/
        services/
        shared/
        systems/
```

## 로컬 실행 방법
1. 의존성 설치
```bash
cd apps/web
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

3. 프로덕션 빌드
```bash
npm run build
```

4. 빌드 결과 미리보기
```bash
npm run preview
```

## 브랜치/배포 메모
- 기본 브랜치: `main`
- 원격 저장소: `https://github.com/cjy-code/debugFigter.git`
- 정적 배포 시 `apps/web` 빌드 산출물(`dist`)을 GitHub Pages로 배포 가능

## 참고
- 루트 README는 프로젝트 개요 중심으로 유지하고,
  앱 상세 설명은 필요 시 `apps/web/README.md`에 확장하는 방식을 권장합니다.
