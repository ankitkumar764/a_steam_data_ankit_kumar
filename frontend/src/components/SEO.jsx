import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEO = ({ title, description, keywords, ogImage, canonicalUrl, schemaMarkup }) => {
  const defaultTitle = 'Steamax | Steam Games Aggregation & Aggressive Analytics';
  const defaultDescription = 'Analyze over 65,000+ Steam games, view detailed rating reviews, track developers, and inspect live revenue stats.';
  const siteUrl = window.location.origin;

  return (
    <Helmet>
      <title>{title ? `${title} | Steamax` : defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl || window.location.href} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title ? `${title} | Steamax` : defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || `${siteUrl}/og-image.jpg`} />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title ? `${title} | Steamax` : defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || `${siteUrl}/og-image.jpg`} />

      {/* Structured Data (JSON-LD) */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
