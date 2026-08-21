# 🗺️ 윙크 어드민 관리 (Wink Admin Map)

윙크 서비스의 팀별 권한 구조를 조회·시뮬레이션하는 관리자용 웹 애플리케이션입니다.

## 🚀 프로젝트 개요
- **기술 스택**: React 18, Vite, Tailwind CSS
- **주요 기능**:
  - 팀별 권한 트리 조회 및 검색
  - 가상 사용자(페르소나) 생성으로 권한 조합 시뮬레이션
  - 엑셀 버전 비교 (이전/현재 권한 변경 사항 diff)
  - 복수 권한 충돌 가이드
  - 권한 데이터 JSON 백업 / 마크다운 명세서 추출 / PDF 인쇄
- **데이터**: 별도 서버·데이터베이스 없이 `public/permission_data.xlsx` 정적 파일을 클라이언트
  에서 직접 파싱(`xlsx` 라이브러리)하여 사용하고, `localStorage`에 캐싱합니다. 순수 정적
  SPA(프론트엔드 전용)입니다.

## 🛠️ 개발 가이드
### 로컬 실행
```bash
cd frontend
npm install
npm run dev
```

### 테스트
```bash
cd frontend
npm test          # vitest 유닛 테스트
npm run test:e2e  # playwright e2e 테스트
```

### 배포 (Docker)
```bash
docker compose up --build -d
```
자세한 배포 절차는 [`DEPLOY.md`](./DEPLOY.md) 참고.

## 📁 저장소 구조
- `frontend/` — 앱 전체 (소스, 정적 자산, 빌드/테스트 설정)
- 루트 — `docker-compose.yml`, `README.md`, `CLAUDE.md`, `DEPLOY.md` 등 배포·문서 파일

---
*개발 시 [`CLAUDE.md`](./CLAUDE.md)의 프로젝트 정책을 반드시 확인하세요.*
