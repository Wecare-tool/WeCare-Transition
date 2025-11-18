import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        base: '/WeCare-Transition/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': 'AIzaSyAMPeL97mZbFmcV5lJTJd0tRHcnj_5qNYk',
        'process.env.GEMINI_API_KEY': 'AIzaSyAMPeL97mZbFmcV5lJTJd0tRHcnj_5qNYk'
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
