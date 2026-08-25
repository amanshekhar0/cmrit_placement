const SITE = "https://cmritplacement.vercel.app";

/**
 * Per-route document head: title, description, canonical, OG, and JSON-LD.
 *
 * Rendered declaratively rather than written from an effect. React 19 hoists
 * <title>, <meta> and <link> into <head> on the client, and -- the reason this
 * matters -- rendering them as real elements means they also appear in the
 * static markup during prerendering, where effects never run. The previous
 * effect-based version left every prerendered page carrying index.html's
 * default title.
 *
 * scripts/prerender.mjs lifts these out of the body and into <head> for the
 * static files.
 */
export default function Seo({ title, description, path, jsonLd, noindex = false }) {
  const canonical = `${SITE}${path || "/"}`;
  const robots = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large";

  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}

      {/* JSON-LD is valid anywhere in the document, so it does not need
          hoisting -- Google reads it from the body just as happily. */}
      {jsonLd && (
        <script
          type="application/ld+json"
          data-route-schema="true"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}

export { SITE };
