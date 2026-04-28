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
debugFigter/
  apps/
    web/
      src/
        main.tsx             # 엔트리 포인트
        App.tsx              # React 루트 컴포넌트
        styles.css           # 전역 스타일
        game/
          constants/         # 게임 상수
          core/              # 초기화/핵심 실행 흐름
          data/              # 정적 데이터(JSON)
          scenes/            # Phaser 씬
          services/          # 저장/외부 연동 서비스
          shared/            # 공용 타입
          systems/           # 전투/스폰/성장 시스템
      index.html             # Vite HTML 템플릿
      package.json           # 스크립트/의존성
      tsconfig*.json         # TypeScript 설정
      vite.config.ts         # Vite 설정
```

## 생성 산출물/캐시
- `apps/web/node_modules`
- `apps/web/dist`
- `apps/web/*.tsbuildinfo`

위 경로는 `.gitignore`로 관리되어 Git 추적 대상에서 제외됩니다.

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
