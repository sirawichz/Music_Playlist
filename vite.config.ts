import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // เพิ่มการนำเข้า Tailwind

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(), // เพิ่ม Tailwind plugin
  ],
  server: {
    proxy: {
      '/api/itunes': {
        target: 'https://itunes.apple.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/itunes/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // แยก Library ออกจากโค้ดที่เราเขียนเอง
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // แยก supabase และ framer-motion ออกเป็น chunk ต่างหาก
            if (id.includes('@supabase') || id.includes('framer-motion')) {
              return 'vendor_heavy';
            }
            return 'vendor'; // library อื่นๆ รวมกันใน vendor
          }
        },
      },
    },
  },
})
