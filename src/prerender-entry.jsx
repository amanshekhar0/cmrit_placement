/**
 * Node-side entry for scripts/prerender.mjs.
 *
 * Re-exports exactly what the prerenderer needs, so it can import a single
 * built module instead of reaching into the JSX source tree (which Node cannot
 * load directly).
 */
export { default as AppRoutes } from "./routes.jsx";
export { seedQuestionData } from "./hooks/useQuestionData.js";
export { slugify, groupCompanies } from "./utils/slug.js";

// Re-exported so the prerenderer uses the SAME react-router module instance the
// routes were bundled against. Importing StaticRouter separately in the script
// gave a second instance whose context the Routes could not see, so every route
// silently fell through to "/" and rendered the landing page.
export { StaticRouter } from "react-router-dom";
