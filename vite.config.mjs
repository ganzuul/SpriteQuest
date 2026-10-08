import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({
    plugins: [svelte()],
    build: { target: 'es2022', lib: { entry: 'ui/entry.js', formats: ['es'], fileName: () => 'silly-canvas-ui.js' }, outDir: 'dist', emptyOutDir: true, minify: true, rolldownOptions: { output: { banner: '/*! Svelte runtime: Copyright (c) 2016-2025 Svelte Contributors. MIT license; see THIRD_PARTY_NOTICES.md. */' } } },
});
