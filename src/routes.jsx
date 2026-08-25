import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import App from "./App.jsx";
import Companies from "./pages/Companies.jsx";
import CompanyPage from "./pages/CompanyPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import { Terms, Privacy, Refund, Contact, Pricing } from "./pages/Legal.jsx";

/**
 * The route table, shared by the browser entry (main.jsx) and the prerenderer
 * (scripts/prerender.mjs).
 *
 * Defined once so a route can never exist in the running app but be missing
 * from the static build, or vice versa.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* The portal itself. /login is where the landing page's sign-in CTA
          goes; App renders its own login card when there is no session. */}
      <Route path="/login" element={<App />} />
      <Route path="/app" element={<App />} />

      {/* Public, crawlable question pages. */}
      <Route path="/companies" element={<Companies />} />
      <Route path="/company/:slug" element={<CompanyPage />} />
      <Route path="/company/:slug/:year" element={<CompanyPage />} />

      {/* Policy pages required for Razorpay activation. */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/refund" element={<Refund />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />

      {/* A distinct noindex page, not a silent fallback to the homepage. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
