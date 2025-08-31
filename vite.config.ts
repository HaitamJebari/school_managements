import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 1. Import 'transformAssetUrls' from the vuetify plugin
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        // 2. Pass the 'transformAssetUrls' to the vue plugin
        vue({
            template: { transformAssetUrls }
        } ),
        vuetify({
            autoImport: true,
            styles: { configFile: 'src/scss/variables.scss' }
        }),
        // sveltekit(),
    ],
    base: "/",
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                // api: 'modern',
                silenceDeprecations : ['import']
            }
        }
    },
    // optimizeDeps: {
    //     exclude: ['vuetify'],
    //     entries: ['./src/**/*.vue']
    // },
    build: {
        rollupOptions: {
            treeshake: false
        }
    },
});
