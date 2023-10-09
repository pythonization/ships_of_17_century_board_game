import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import django_vite_plugin from 'django-vite-plugin'

const { 'default': djangoVite } = django_vite_plugin;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        djangoVite([
            'ship_game/pages/map_editor.jsx',
            'ship_game/pages/all_pages.js',
        ])
    ],

    test: {
        environment: 'jsdom',
        setupFiles: './ship_game/js_tests/setup_test.js'
    }
})
