import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        productList: resolve(__dirname, 'product-list.html'),
        product: resolve(__dirname, 'product.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        purchase: resolve(__dirname, 'purchase.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // When running Vercel CLI locally
        changeOrigin: true,
      }
    }
  }
});
