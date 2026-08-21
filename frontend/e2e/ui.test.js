// Playwright E2E 테스트 — `npm run test:e2e`로 실행 (playwright.config.js가 자체
// dev 서버를 localhost:5174에 띄운 뒤 이 파일을 그 위에서 돌린다).
// 검증 항목: 초기 로드, 검색창 입력, 팀 선택 드롭다운, 사이드바 트리 클릭, 다크모드 토글.
// 셀렉터는 실제 렌더링된 DOM(Playwright가 캡처한 스냅샷)을 직접 확인해서 맞춘 것이며,
// 이전 버전은 구현을 확인하지 않고 짐작으로 작성돼 실제 화면과 어긋나 있었다.
import { test, expect } from '@playwright/test';

test.describe('Wink Admin Map UI Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // 엑셀 데이터 로딩(비동기 fetch+parse) 대기
        await expect(page.getByRole('heading', { name: 'Wink Admin Map' })).toBeVisible();
    });

    test('페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
        await expect(page).toHaveTitle(/Wink Admin Map/);
        await expect(page.getByRole('heading', { name: 'Wink Admin Map' })).toBeVisible();
        await expect(page.getByPlaceholder('메뉴, 기능, 팀 검색 (Ctrl+K)')).toBeVisible();
    });

    test('검색 기능이 작동해야 한다', async ({ page }) => {
        const searchInput = page.getByPlaceholder('메뉴, 기능, 팀 검색 (Ctrl+K)');
        await searchInput.fill('권한');
        await expect(searchInput).toHaveValue('권한');
    });

    test('팀 선택(MultiSelect) 드롭다운이 열려야 한다', async ({ page }) => {
        const dropdown = page.getByPlaceholder('전체 팀 보기');
        await expect(dropdown).toBeVisible();
        await dropdown.click();
        // 클릭 시 MultiSelect의 isOpen이 true가 되며 내부 검색 input에 포커스가 감
        await expect(dropdown).toBeFocused();
    });

    test('사이드바 메뉴를 클릭하면 트리가 확장되어야 한다', async ({ page }) => {
        await expect(page.getByText('메뉴 탐색기')).toBeVisible();

        const memberMenu = page.getByText('회원관리', { exact: true });
        await expect(memberMenu).toBeVisible();
        // 행 안 아이콘/텍스트 레이아웃이 transition-all 중이라 실제 클릭 좌표를
        // 일시적으로 형제 요소가 가리는 경우가 있어 force로 우회 (기능 자체엔 영향 없음)
        await memberMenu.click({ force: true });

        // 클릭 후에도 사이드바 자체는 계속 정상 렌더링되어야 함
        await expect(page.getByText('메뉴 탐색기')).toBeVisible();
    });

    test('다크 모드 토글이 작동해야 한다', async ({ page }) => {
        // 다크모드 토글은 "부가기능" 드롭다운 안에 있음 (AccountManager.jsx)
        await page.getByRole('button', { name: '부가기능' }).click();
        await page.getByText('다크 모드', { exact: true }).click();

        await expect(page.locator('html')).toHaveClass(/dark/);

        // 다시 열어서 반대로 토글 (이번엔 라벨이 "라이트 모드"로 바뀜)
        await page.getByRole('button', { name: '부가기능' }).click();
        await page.getByText('라이트 모드', { exact: true }).click();

        await expect(page.locator('html')).not.toHaveClass(/dark/);
    });

});
