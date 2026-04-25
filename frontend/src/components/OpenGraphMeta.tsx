import React, { useEffect, useMemo } from 'react';

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  locale?: string;
  hashtags?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  player?: string;
  playerWidth?: number;
  playerHeight?: number;
  playerStream?: string;
}

interface OpenGraphMetaProps {
  openGraph?: OpenGraphData;
  twitter?: TwitterCardData;
  additionalMeta?: { [key: string]: string };
}

const OpenGraphMeta: React.FC<OpenGraphMetaProps> = ({
  openGraph,
  twitter,
  additionalMeta = {},
}) => {
  // Generate default values
  const defaultOpenGraph: OpenGraphData = useMemo(() => ({
    title: 'NEPA - Decentralized Utility Payment Platform',
    description: 'Pay your utility bills securely with cryptocurrency on the Stellar blockchain. Fast, transparent, and reliable utility payments.',
    url: window.location.href,
    type: 'website',
    siteName: 'NEPA Platform',
    locale: 'en_US',
  }), []);

  const defaultTwitter: TwitterCardData = useMemo(() => ({
    card: 'summary_large_image',
    site: '@nepa_platform',
    title: 'NEPA - Decentralized Utility Payment Platform',
    description: 'Pay your utility bills securely with cryptocurrency on the Stellar blockchain.',
  }), []);

  // Merge with provided data
  const finalOpenGraph = { ...defaultOpenGraph, ...openGraph };
  const finalTwitter = { ...defaultTwitter, ...twitter };

  // Generate meta tags
  const metaTags = useMemo(() => {
    const tags: JSX.Element[] = [];

    // Basic OpenGraph tags
    tags.push(<meta key="og:title" property="og:title" content={finalOpenGraph.title} />);
    tags.push(<meta key="og:description" property="og:description" content={finalOpenGraph.description} />);
    tags.push(<meta key="og:url" property="og:url" content={finalOpenGraph.url} />);
    tags.push(<meta key="og:type" property="og:type" content={finalOpenGraph.type || 'website'} />);
    tags.push(<meta key="og:site_name" property="og:site_name" content={finalOpenGraph.siteName || 'NEPA Platform'} />);
    tags.push(<meta key="og:locale" property="og:locale" content={finalOpenGraph.locale || 'en_US'} />);

    // Image tags
    if (finalOpenGraph.image) {
      tags.push(<meta key="og:image" property="og:image" content={finalOpenGraph.image} />);
      tags.push(<meta key="og:image:width" property="og:image:width" content="1200" />);
      tags.push(<meta key="og:image:height" property="og:image:height" content="630" />);
      tags.push(<meta key="og:image:type" property="og:image:type" content="image/png" />);

      if (finalOpenGraph.imageAlt) {
        tags.push(<meta key="og:image:alt" property="og:image:alt" content={finalOpenGraph.imageAlt} />);
      }
    }

    // Article specific tags
    if (finalOpenGraph.type === 'article') {
      if (finalOpenGraph.author) {
        tags.push(<meta key="article:author" property="article:author" content={finalOpenGraph.author} />);
      }
      if (finalOpenGraph.publishedTime) {
        tags.push(<meta key="article:published_time" property="article:published_time" content={finalOpenGraph.publishedTime} />);
      }
      if (finalOpenGraph.modifiedTime) {
        tags.push(<meta key="article:modified_time" property="article:modified_time" content={finalOpenGraph.modifiedTime} />);
      }
      if (finalOpenGraph.section) {
        tags.push(<meta key="article:section" property="article:section" content={finalOpenGraph.section} />);
      }
      if (finalOpenGraph.tags && finalOpenGraph.tags.length > 0) {
        finalOpenGraph.tags.forEach((tag, index) => {
          tags.push(<meta key={`article:tag:${index}`} property="article:tag" content={tag} />);
        });
      }
    }

    // Twitter Card tags
    tags.push(<meta key="twitter:card" name="twitter:card" content={finalTwitter.card} />);
    tags.push(<meta key="twitter:title" name="twitter:title" content={finalTwitter.title} />);
    tags.push(<meta key="twitter:description" name="twitter:description" content={finalTwitter.description} />);

    if (finalTwitter.site) {
      tags.push(<meta key="twitter:site" name="twitter:site" content={finalTwitter.site} />);
    }
    if (finalTwitter.creator) {
      tags.push(<meta key="twitter:creator" name="twitter:creator" content={finalTwitter.creator} />);
    }
    if (finalTwitter.image) {
      tags.push(<meta key="twitter:image" name="twitter:image" content={finalTwitter.image} />);
      if (finalTwitter.imageAlt) {
        tags.push(<meta key="twitter:image:alt" name="twitter:image:alt" content={finalTwitter.imageAlt} />);
      }
    }

    // Player card specific tags
    if (finalTwitter.card === 'player') {
      if (finalTwitter.player) {
        tags.push(<meta key="twitter:player" name="twitter:player" content={finalTwitter.player} />);
      }
      if (finalTwitter.playerWidth) {
        tags.push(<meta key="twitter:player:width" name="twitter:player:width" content={finalTwitter.playerWidth.toString()} />);
      }
      if (finalTwitter.playerHeight) {
        tags.push(<meta key="twitter:player:height" name="twitter:player:height" content={finalTwitter.playerHeight.toString()} />);
      }
      if (finalTwitter.playerStream) {
        tags.push(<meta key="twitter:player:stream" name="twitter:player:stream" content={finalTwitter.playerStream} />);
      }
    }

    // Additional meta tags
    Object.entries(additionalMeta).forEach(([key, value]) => {
      tags.push(<meta key={key} name={key} content={value} />);
    });

    return tags;
  }, [finalOpenGraph, finalTwitter, additionalMeta]);

  return (
    <>
      <title>{finalOpenGraph.title}</title>
      <meta name="description" content={finalOpenGraph.description} />
      {metaTags.map((tag, index) => React.cloneElement(tag, { key: index }))}

      {/* Additional SEO meta tags */}
      <meta name="keywords" content="NEPA, utility payments, cryptocurrency, Stellar blockchain, decentralized payments, electricity bills, water bills" />
      <meta name="author" content="NEPA Platform" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />

      {/* Canonical URL */}
      <link rel="canonical" href={finalOpenGraph.url} />

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": finalOpenGraph.siteName || "NEPA Platform",
          "description": finalOpenGraph.description,
          "url": finalOpenGraph.url,
          "image": finalOpenGraph.image,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${window.location.origin}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </>
  );
};

export default OpenGraphMeta;
