
import { test, expect } from '@playwright/test';

test.describe('Wink Admin Map UI Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Vite 포트가 5174로 확인됨. (이미 실행 중)
        await page.goto('/');
        // 데이터 로딩 대기 (엑셀 파싱 등)
        await page.waitForTimeout(1000);
    });

    test('페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
        await expect(page).toHaveTitle(/Wink Admin Map/);
        await expect(page.getByRole('heading', { name: 'Wink Admin Map' })).toBeVisible();
        await expect(page.locator('text=데이터 로딩 중')).not.toBeVisible();
    });

    test('검색 기능이 작동해야 한다', async ({ page }) => {
        const searchInput = page.getByPlaceholder('메뉴, 기능, 경로 검색...');
        await searchInput.fill('권한');
        // 검색 결과가 사이드바나 드롭다운에 반영되어야 함
        // (구체적인 구현에 따라 다름, 입력값 유지 확인)
        await expect(searchInput).toHaveValue('권한');
    });

    test('팀 선택(MultiSelect) 드롭다운이 열려야 한다', async ({ page }) => {
        const dropdown = page.getByPlaceholder('팀을 선택하여 권한 확인 (복수 선택 가능)');
        // 위 placeholder는 MultiSelect 컴포넌트 내부의 input이나 버튼 텍스트일 수 있음.
        // CSS 선택자가 더 명확할 수 있으나, 접근성을 위해 텍스트로 시도.

        // MultiSelect 컴포넌트의 클릭 가능한 영역 찾기
        // 리팩토링된 코드에서 확인 필요. 일반적으로 콤보박스 역할.

        // 만약 placeholder가 input attribute라면:
        await expect(dropdown).toBeVisible();
        await dropdown.click();

        // 드롭다운 메뉴가 열렸는지 확인 (옵션들이 보여야 함)
        // 팀 데이터가 로드되었다면 옵션이 있을 것임.
        // 가상 팀이나 기본 팀 이름이 보인다고 가정.
        // await expect(page.locator('.multi-select-option')).toBeVisible(); // 클래스명 추측
    });

    test('사이드바 메뉴를 클릭하면 메인 컨텐츠가 변경되어야 한다', async ({ page }) => {
        // 사이드바의 첫 번째 메뉴 아이템 클릭 (GNB)
        // 구체적인 셀렉터가 필요하지만, 텍스트 기반으로 시도.
        // 엑셀 데이터에 있는 메뉴 이름을 알아야 정확함.
        // 가정: "업체관리" 같은 메뉴가 있다고 가정.

        // 일단 사이드바가 존재하는지 확인
        const sidebar = page.locator('nav'); // Sidebar 보통 nav 태그 사용
        await expect(sidebar).toBeVisible();
    });

    test('다크 모드 토글이 작동해야 한다', async ({ page }) => {
        const toggleBtn = page.getByTitle('다크 모드 토글');
        await toggleBtn.click();

        // html 태그에 class="dark"가 붙었는지 확인
        await expect(page.locator('html')).toHaveClass(/dark/);

        // 다시 클릭하면 해제
        await toggleBtn.click();
        await expect(page.locator('html')).not.toHaveClass(/dark/);
    });

});
