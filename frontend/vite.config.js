// Vite 빌드 설정 + Vitest 유닛 테스트 설정.
// - build: `npm run build` 시 dist/ 산출물을 만드는 방식을 정의 (Docker 빌드 1단계에서 사용).
// - test: `npm test`(vitest)가 src/tests/*.test.js를 jsdom 환경에서 돌리도록 설정.
//   frontend/e2e/**(Playwright 전용 e2e 테스트)는 vitest 대상에서 제외한다 — 안 그러면
//   vitest가 Playwright 문법(test.describe 등)을 잘못 실행하려다 에러가 난다.
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    exclude: [...configDefaults.exclude, 'e2e/**'], // e2e/는 vitest가 아닌 playwright 전용
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // 폴더 비우기 과정 생략 (충돌 방지)
    minify: false,      // 압축 끄기
    sourcemap: false,   // 소스맵 생략
    cssCodeSplit: false, // CSS 분리 안 함
    lib: false,
    rollupOptions: {
      cache: false, // 캐시 사용 안 함 (메모리 아끼기)
      output: {
        manualChunks: undefined,
        format: 'es'
      }
    }
  }
})
