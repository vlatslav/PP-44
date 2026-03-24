import basicSsl from '@vitejs/plugin-basic-ssl'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "path"; // Імпорт модуля path
import {fileURLToPath} from "url"; // Для роботи з ES Modules

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl({
    name: 'test',
    domains: ['*.custom.com'],
    certDir: '/Users/.../.devServer/cert'
  })],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Псевдонім @ для src
    },
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `@import "@/styles/main.scss";`, // Глобальний імпорт, якщо потрібно
  //     },
  //   },
  // },
})
