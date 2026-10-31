import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const appEntry = path.resolve(projectDirectory, 'src/js/index.js');

export default defineConfig({
  root: projectDirectory,
  base: './',
  css: {
    postcss: path.resolve(projectDirectory, 'postcss.config.mjs'),
  },
  esbuild: {
    loader: 'jsx',
    include: /src[\\/]js[\\/].*\.js$/,
    exclude: [],
  },
  build: {
    outDir: path.resolve(projectDirectory, 'bundles'),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: appEntry,
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});
