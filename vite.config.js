import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '~', replacement: '/src' }
    ]
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three') || id.includes('d3-force') || id.includes('react-force-graph') || id.includes('three-spritetext')) return 'vendor-3d'
            if (id.includes('mapbox-gl')) return 'vendor-mapbox'
            if (id.includes('maplibre-gl') || id.includes('react-map-gl')) return 'vendor-maplibre'
            if (id.includes('@turf/turf')) return 'vendor-turf'
            if (id.includes('lodash')) return 'vendor-lodash'
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) return 'vendor-redux'
            if (id.includes('react-router-dom')) return 'vendor-router'
            if (id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react-dom'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n'
          }
        }
      }
    }
  }
})
