
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindConfig from './tailwind.config.cjs';

export default defineConfig(({ mode }) => {
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
            proxy: {
                '/api': 'http://localhost:5000'
            }
        },
        plugins: [
            react()
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        },
        css: {
            postcss: {
                plugins: [
                    tailwindcss(tailwindConfig),
                    autoprefixer,
                ],
            },
        }
    };
});
