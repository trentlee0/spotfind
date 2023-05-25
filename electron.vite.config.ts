import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '~': resolve('src')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        '~': resolve('src')
      }
    },
    build: {
      rollupOptions: {
        external: ['node', 'electron']
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '~': resolve('src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      })
    ]
  }
})
