# 개발 제한 사항 및 핵심 보호 규칙

## 🛡️ 사이드바 핵심 로직 보호 (Sidebar Core Logic Protection)
**현재 상태: 필수 준수 (MANDATORY)**

`src/components/Sidebar.jsx`에 구현된 다음 핵심 로직들은 매우 정밀하게 설계되었습니다. 사용자(USER)의 명시적인 허락 없이는 절대 수정해서는 **안 됩니다.**

### 보호 영역 (Protected Areas):
1. **데이터 계층 및 처리 (Data Hierarchy & Processing)**: `menuStructure` 프롭과 관련된 모든 로직 및 트리 탐색 방식.
2. **권한 로직 (`hasAccess`)**: `permissions`와 `selectedTeams`를 기반으로 특정 메뉴 노드에 대한 접근 권한을 결정하는 함수 및 로직.
3. **확장 상태 관리 (`expandedNodes`)**: 상태 관리 방식, 검색/활성 노드에 따른 자동 확장을 처리하는 `useEffect` 훅, 그리고 `toggleNode` 로직.
4. **재귀 렌더링 (`renderTree`)**: 재귀적 구조 및 깊이(Depth) 기반의 렌더링 로직 전체.

### 허용되는 작업 (스타일링 한정):
- 시각적 미학을 위한 CSS 클래스(Tailwind) 업데이트.
- 장식용 아이콘 또는 테마 색상 변경.
- 재귀적 깊이 로직을 해치지 않는 선에서의 패딩/마진 조정.

---
*참고: 위의 보호 영역에 대한 구조적 변경이나 리팩토링은 반드시 사전에 사용자의 확인을 거쳐야 합니다.*
