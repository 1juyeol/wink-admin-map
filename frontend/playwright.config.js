import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    retries: 2,
    use: {
        baseURL: 'http://localhost:5174', // Default Vite port, confirm if correct
        trace: 'on-first-retry',
    },
    // 엑셀 파싱(수백KB)이 끝나야 첫 화면이 뜨는데, 워커 5개가 동시에 파싱하면
    // 기본 5초 assertion 타임아웃을 넘기는 경우가 있어 넉넉하게 늘림
    expect: {
        timeout: 10 * 1000,
    },
    webServer: {
        command: 'npm run dev',
        port: 5174,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
