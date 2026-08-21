import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
