import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 4271,
            host: '0.0.0.0',
        },
        build: {
            rollupOptions: {
                output: {
                    entryFileNames: `assets/[name]-[hash]-v2.js`,
                    chunkFileNames: `assets/[name]-[hash]-v2.js`,
                    assetFileNames: `assets/[name]-[hash]-v2.[ext]`
                }
            }
        },
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'favicon.png'],
                manifest: {
                    name: 'Reconnected',
                    short_name: 'Reconnected',
                    description: 'The elite campus collective',
                    theme_color: '#030303',
                    background_color: '#030303',
                    display: 'standalone',
                    orientation: 'portrait',
                    start_url: '/',
                    icons: [
                        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
                    ]
                },
                workbox: {
                    clientsClaim: true,
                    skipWaiting: true,
                    cleanupOutdatedCaches: true,
                    importScripts: ['sw-custom.js'],
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
                }
            })
        ],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
