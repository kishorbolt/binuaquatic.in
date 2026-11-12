import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TC_PLANTS_DIR = path.resolve(__dirname, 'public', 'TC Live Plants');
const VIRTUAL_TC_PLANTS_ID = 'virtual:tc-live-plants';
const RESOLVED_VIRTUAL_TC_PLANTS_ID = '\0' + VIRTUAL_TC_PLANTS_ID;
const SUPPORTED_PLANT_EXTENSIONS = /\.(jpe?g|png|webp|avif|gif)$/i;

function readTcPlantFilenames() {
  if (!fs.existsSync(TC_PLANTS_DIR)) return [];
  return fs
    .readdirSync(TC_PLANTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && SUPPORTED_PLANT_EXTENSIONS.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

function tcLivePlantsManifestPlugin() {
  return {
    name: 'tc-live-plants-manifest',
    resolveId(id) {
      if (id === VIRTUAL_TC_PLANTS_ID) {
        return RESOLVED_VIRTUAL_TC_PLANTS_ID;
      }
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_TC_PLANTS_ID) {
        const files = readTcPlantFilenames();
        return `export default ${JSON.stringify(files)};`;
      }
      return null;
    },
    configureServer(server) {
      const handleFsUpdate = (filePath) => {
        if (!filePath.startsWith(TC_PLANTS_DIR)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_TC_PLANTS_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      };
      server.watcher.add(TC_PLANTS_DIR);
      server.watcher.on('add', handleFsUpdate);
      server.watcher.on('unlink', handleFsUpdate);
    }
  };
}

export default defineConfig({
  plugins: [react(), tcLivePlantsManifestPlugin()],
  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
