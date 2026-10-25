import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const resumeBackendProxy = {
  target: 'http://localhost:8787',
  changeOrigin: true,
  headers: {
    Origin: 'http://localhost:5173',
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/health': resumeBackendProxy,
      '/api/config': resumeBackendProxy,
      '/api/analyze': resumeBackendProxy,
      '/api/rewrite': resumeBackendProxy,
      '/api/document': resumeBackendProxy,
      '/api/resume-document': resumeBackendProxy,
      '/api/vacancies': resumeBackendProxy,
      '/api/interview': resumeBackendProxy,
      '/api/sessions': resumeBackendProxy,
      '/api/company-library': resumeBackendProxy,
      '/api/dashboard': resumeBackendProxy,
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
