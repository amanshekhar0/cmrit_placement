/**
 * Stub for pdfjs-dist during the prerender (SSR) build.
 *
 * Vite's SSR build hoists lazy imports into static ones, so pdfjs-dist was
 * evaluated at module load and immediately threw on `new DOMMatrix()` -- a
 * browser API that does not exist in Node.
 *
 * Safe to stub: pdf.js is only reached from the mock interviewer and the notes
 * viewer, both of which live behind auth and are never prerendered. If anything
 * ever does call into it during a build, these throw loudly rather than
 * silently rendering a broken page.
 */
const notAvailable = () => {
  throw new Error('pdfjs-dist is stubbed during prerendering and must not be called');
};

export const GlobalWorkerOptions = { workerSrc: '' };
export const getDocument = notAvailable;
export const version = '0.0.0-prerender-stub';
export default { GlobalWorkerOptions, getDocument, version };
