import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'vite-plugin-fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fs({
      allow: ['../defaultSettings.json'],
      port: 7070,
    })
  ],
  server: {
    proxy: {
      // ���������� ��� ������� �� ngrok �� localhost:7070
      '/src/config/defaultSettings.json?cmd=writeFile': {
        target: 'http://localhost:7070',
        changeOrigin: true, 
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.method === 'OPTIONS') {
              proxyReq.setHeader('Access-Control-Allow-Origin', '*')  
              proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
              proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              
              // ��������� ������������� ������� �� ������� Vite
              res.writeHead(200);
              res.end();
            }
          });
        }
      }
    }  
  }
})