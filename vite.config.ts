import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist', // إجبار المخرجات تنزل في مجلد dist النظيف
    emptyOutDir: true, // مسح المجلد القديم عشان ينزل الكود الجديد بالكامل
  },
});
