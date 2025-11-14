import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // load .env files and pick VITE_* vars
  const env = loadEnv(mode, process.cwd(), '');

  // Proxy targets can be configured via env variables for dev only:
  // VITE_USER_API_PROXY -> e.g. http://127.0.0.1:8000
  // VITE_HISTORICAL_API_PROXY -> e.g. http://localhost:5555
  const userApiProxy = env.VITE_USER_API_PROXY || 'http://127.0.0.1:8000';
  const historicalApiProxy = env.VITE_HISTORICAL_API_PROXY || 'http://localhost:5555';

  return {
    plugins: [react()],
    assetsInclude: ['**/*.glb'],
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable source maps in production for security
      rollupOptions: {
        onwarn(warning, warn) {
          // Skip certain warnings
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            three: ['three', '@react-three/fiber', '@react-three/drei']
          }
        }
      }
    },
    server: {
      port: 5173,
      host: true, // Allow external connections in development
      proxy: {
        // Proxy user API requests
        '/api': {
          target: userApiProxy,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        // Proxy historical API requests (use prefix /historical in frontend)
        '/historical': {
          target: historicalApiProxy,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/historical/, '/'),
        },
      },
    }
  };
});
