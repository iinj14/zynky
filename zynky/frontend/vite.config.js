// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy → ส่ง /api request ไป Backend โดยอัตโนมัติ
    // ทำให้ Frontend เรียก /api/posts แทน http://localhost:5000/api/posts
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
