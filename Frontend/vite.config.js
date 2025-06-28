import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-server-configs',
      closeBundle() {
        // Ensure the files exist in public directory
        const configs = [
          { src: '_redirects', dest: '_redirects' },
          { src: 'web.config', dest: 'web.config' },
          { src: '.htaccess', dest: '.htaccess' }
        ];

        configs.forEach(({ src, dest }) => {
          try {
            if (!fs.existsSync('dist')) {
              fs.mkdirSync('dist');
            }
            
            // Copy from public if exists, otherwise create new
            const sourcePath = path.resolve('public', src);
            const destPath = path.resolve('dist', dest);
            
            if (fs.existsSync(sourcePath)) {
              fs.copyFileSync(sourcePath, destPath);
            }
          } catch (err) {
            console.warn(`Warning: Could not copy ${src}`, err);
          }
        });
      }
    }
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  base: '/'
})
