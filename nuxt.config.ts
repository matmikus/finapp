import { defineNuxtConfig } from 'nuxt';
import eslintPlugin from 'vite-plugin-eslint';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    css: [],
    srcDir: 'src',
    vite: {
        plugins: [
            eslintPlugin()
        ]
    }
});
