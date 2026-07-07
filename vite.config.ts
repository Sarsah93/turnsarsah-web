import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,   // 포트 충돌 시 다른 포트로 자동 변경 방지 (Tauri devUrl과 일치 필요)
    host: false,        // 외부 노출 차단 (보안)
  },
  // Tauri 환경변수(TAURI_ENV_*)를 Vite에서 접근 가능하게 허용
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  esbuild: {
    // 프로덕션 모드일 때만 콘솔 로그 및 디버거 문 제거
    drop: mode !== 'development' ? ['console', 'debugger'] : [],
  },
  build: {
    // Tauri는 Chromium 기반 WebView2를 사용하므로 최신 타겟 지정 가능
    target: 'chrome105',
    minify: 'esbuild',
    sourcemap: false,   // 프로덕션 빌드에서 소스맵 제거
    // Tauri에서 청크 파일 크기 경고 임계값 상향 (에셋이 많으므로)
    chunkSizeWarningLimit: 1600,
  },
}))
