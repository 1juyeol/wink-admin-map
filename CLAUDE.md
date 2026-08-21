# CLAUDE.md

## 프로젝트 개요
윙크 서비스 관리자용 권한 구조 조회 도구. React + Vite + Tailwind CSS로 동작하는 순수
프론트엔드 SPA. 백엔드/DB 없음 — `public/permission_data.xlsx` 정적 엑셀 파일을 클라이언트
사이드에서 파싱해 화면에 렌더링한다.

## 기술 스택
- **Frontend**: React 18, Vite, Tailwind CSS
- **데이터**: `xlsx` 라이브러리로 `public/permission_data.xlsx`를 클라이언트에서 파싱
  (`frontend/src/utils/excelParser.js`) 후 `localStorage`에 캐싱 (`frontend/src/hooks/usePermissionData.js`)
- **배포**: Docker Compose (frontend/nginx 단일 컨테이너), 자세한 절차는 [`DEPLOY.md`](./DEPLOY.md)

## 저장소 구조
- `frontend/` — 앱 전체 (src, public, 빌드 설정, 테스트)
- 루트 — `docker-compose.yml`, `README.md`, `CLAUDE.md`, `DEPLOY.md`, `.gitignore`만 유지

## 개발 시 주의사항
- 프론트 명령어는 `frontend/` 안에서 실행 (`cd frontend && npm run dev`)
- 새로 만드는 파일(설정 파일 포함)은 최상단에 이 파일이 뭘 하는지, 왜 이렇게 구성했는지
  설명하는 주석을 남긴다 (`frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`
  참고). 한 줄 요약으로 끝내지 말고 주요 동작·의존 관계까지 적는다.
- 한글 문자열을 다루는 파일을 새로 만들거나 수정할 때 인코딩을 명시해야 하는 경우 UTF-8을 쓴다.

## 테스트
- **유닛 테스트(vitest)**: `frontend/src/tests/*.test.js`. 실행: `cd frontend && npm test`
- **E2E 테스트(playwright)**: `frontend/e2e/*.test.js`. 실행: `cd frontend && npm run test:e2e`
- 테스트를 새로 추가하거나 셀렉터를 쓸 때는 반드시 실제 렌더링된 화면(DOM)을 확인하고
  맞춘다 — 구현을 확인하지 않고 짐작으로 쓴 셀렉터는 나중에 전부 다시 고쳐야 한다.

---

## 완료된 리팩토링

### Firebase Hosting 이탈 → Docker(nginx) 자체 호스팅 + frontend/ 구조 재편
회사 정책(외부 서비스 연동 금지)에 따라 Firebase Hosting을 걷어내고 자체 호스팅 스택으로
전환. 이 프로젝트는 Firebase를 정적 파일 배포(Hosting) 용도로만 썼을 뿐 Firestore/Firebase
Auth는 애초에 사용한 적이 없어(로그인은 `AccountManager.jsx`의 하드코딩 체크, 데이터는
클라이언트 Excel 파싱), teams-kanban-board처럼 백엔드를 새로 만들 필요는 없었다.
- `firebase.json`, `.firebaserc` 삭제
- `frontend/Dockerfile`(멀티스테이지: `npm run build` → nginx 정적 서빙) +
  `frontend/nginx.conf`(SPA fallback) + 루트 `docker-compose.yml`(frontend 단일 서비스)로 교체
- 저장소 루트 구조를 teams-kanban-board와 동일하게 `frontend/` 하위로 재편 (src, public,
  index.html, vite/eslint/tailwind/postcss config, package.json, playwright 테스트, e2e/ 이동)
- 라이브 Firebase Hosting은 새 배포 검증 후 비활성화 (프로젝트 자체는 유지)
- 기존 테스트가 실제 화면과 어긋나 있던 것도 함께 정비: `vite.config.js`에 누락돼 있던
  vitest 환경 설정(jsdom, setupFiles) 추가, `frontend/e2e/ui.test.js`의 셀렉터를 실제 DOM
  기준으로 전면 교정 (검증 없이 짐작으로 작성돼 있었음)

### 루트에 남아있던 옛 잔재 정리
`frontend/` 재편 이후에도 루트에 남아있던 죽은 파일들을 삭제했다.
- `src_backup_before_refactor/`, `src_backup_before_refactoring_final/` — 예전 리팩토링 이전
  `src/` 백업 스냅샷 (지금 안 쓰는 컴포넌트까지 포함)
- `update_excel.py`, `update_embedded_excel.mjs` — 엑셀을 base64로 코드에 박아넣던 옛 방식
  (`embeddedExcel.js`)을 갱신하던 스크립트. 지금은 그 방식 자체를 안 쓰고(`permission_data.xlsx`를
  런타임에 fetch) 코드 어디서도 참조하지 않아 완전히 죽어있었음
- 빈 `docs/` 폴더, 오래된 루트 `test-results/`, 잘못 커밋됐던 `final_clean_build_log.txt` 삭제

---

## 프로젝트 정책

팀이 합의한 규칙. 코드 변경 시 아래를 따른다.

## [정책 1] 사이드바 핵심 로직은 사용자 명시적 허락 없이 구조 변경하지 않는다

`frontend/src/components/Sidebar.jsx`의 다음 로직은 매우 정밀하게 설계되어 있어, 스타일링
(Tailwind 클래스, 아이콘, 색상, 패딩/마진) 외의 구조적 변경·리팩토링은 반드시 사전에 사용자
확인을 거친다.
- 데이터 계층 및 처리: `menuStructure` 프롭과 관련된 모든 로직 및 트리 탐색 방식
- 권한 로직(`hasAccess`): `permissions`와 `selectedTeams` 기반 접근 권한 판정
- 확장 상태 관리(`expandedNodes`): 상태 관리 방식, 검색/활성 노드 자동 확장 `useEffect`, `toggleNode` 로직
- 재귀 렌더링(`renderTree`): 재귀 구조 및 깊이(depth) 기반 렌더링 로직 전체
