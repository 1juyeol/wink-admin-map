import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    retries: 2,
    use: {
        baseURL: 'http://localhost:5174', // Default Vite port, confirm if correct
        trace: 'on-first-retry',
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
