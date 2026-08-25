import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// fileURLToPath, not URL.pathname: on Windows the latter yields "/C:/..." which
// then resolves to "C:\C:\...".
const STUB = fileURLToPath(new URL('./scripts/pdfjs-stub.js', import.meta.url))

/**
 * Builds the prerender entry for Node.
 *
 * Separate from the client build: this one targets node (externalising
 * react/react-dom) and emits a plain ESM module rather than a browser bundle.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Exact-match regexes, not a bare string. A string alias prefix-matches, so
    // "pdfjs-dist" also rewrote "pdfjs-dist/build/pdf.worker.min.mjs?url" into
    // a path underneath the stub file.
    alias: [
      { find: /^pdfjs-dist$/, replacement: STUB },
      { find: /^pdfjs-dist\/build\/pdf\.worker\.min\.mjs(\?.*)?$/, replacement: STUB },
    ],
  },
  build: {
    ssr: 'src/prerender-entry.jsx',
    outDir: 'dist/prerender-entry',
    emptyOutDir: true,
    rollupOptions: {
      output: { entryFileNames: 'entry.js', format: 'es' },
    },
  },
})
