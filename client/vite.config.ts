import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 3101,
    proxy: {
      '/jeecg-boot': {
        target: 'http://192.168.1.128:8080',
        changeOrigin: true,
      },
    },
  },
})
