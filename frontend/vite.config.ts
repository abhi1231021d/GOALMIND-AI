import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_URL = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:8080';
const RESUME_BACKEND_URL = process.env.RESUME_BACKEND_URL || process.env.VITE_RESUME_BACKEND_URL || 'http://localhost:8787';

const resumeBackendProxy = {
  target: RESUME_BACKEND_URL,
  changeOrigin: true,
  secure: false,
};

const apiProxyConfig = {
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
    target: BACKEND_URL,
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['goalmind-ai.onrender.com', '.onrender.com', 'localhost', '127.0.0.1'],
    proxy: apiProxyConfig,
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: ['goalmind-ai.onrender.com', '.onrender.com', 'localhost', '127.0.0.1'],
    proxy: apiProxyConfig,
  },
});
