import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

function pathResolve(dir) {
  return resolve(__dirname, '.', dir)
}

// Configuration: https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  resolve: {
    extensions: ['.js', '.ts', '.vue', '.json'],
    alias: {
      '@': pathResolve('src'),
      '@images': resolve('src/assets/images'),
      '@contracts': resolve('src/contracts'),
      'vue': 'vue/dist/vue.esm-bundler.js',
      'web3': 'web3/dist/web3.min.js',
    }
  },
  plugins: [
    vue(),
    svgLoader(),
  ],
  server: {
    port: 8000,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/contracts\/.*\.json/.test(id)) {
            console.log(id)
            return 'contract'
          } else if (id.includes('web3')) {
            return 'web3'
          } else if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'lodash'
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `$injectedColor: orange;`
        additionalData: '@import "@/assets/styles/global.scss";'
      }
    }
  },
  define: {
  }
})
