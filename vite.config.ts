import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [react(), viteStaticCopy({
    targets: [
      {
        src: 'manifest.json',
        dest: '.' // dist/로 복사
      },
      {
        src: 'public/icon*.png',
        dest: '.' // 아이콘도 같이 복사
      },
    ]
  })],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.tsx"),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        assetFileNames: (info) => {
          if (info.name?.endsWith('.css')) {
            return 'assets/[name].css'; // 해시 제거
          }
          return 'assets/[name]-[hash][extname]';
        },
      }
    },
    emptyOutDir: true,
    target: "esnext",
  },
});
