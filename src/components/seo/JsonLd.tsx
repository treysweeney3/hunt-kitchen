import React from 'react';

interface JsonLdProps {
  data:
    | Record<string, unknown>
    | Array<Record<string, unknown>>;
}

/**
 * Component to inject JSON-LD structured data into the page head
 * Follows Google's structured data guidelines
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0), // Minified for production
      }}
    />
  );
}
