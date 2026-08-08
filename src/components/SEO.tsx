import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title,
  description,
  keywords = "decoração, festas, eventos, aluguel de decoração, festança decorações, decoração infantil, 15 anos, casamentos",
  image = "/og-image.webp",
  url = "https://festancadecoracoes.com.br",
  type = "website",
}: SEOProps) => {
  const { data: siteSettings } = useSiteSettings();

  const defaultSiteName = siteSettings?.site_name || "Festança Decorações";
  const defaultDesc = siteSettings?.description || "Decorações premium para festas, temas exclusivos e pacotes elegantes de locação.";
  const favicon = siteSettings?.favicon_url;

  const pageTitle = title
    ? title.includes(defaultSiteName) ? title : `${title} | ${defaultSiteName}`
    : `${defaultSiteName} | Momentos Mágicos, Memórias Inesquecíveis`;

  const pageDesc = description || defaultDesc;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="keywords" content={keywords} />
      {favicon && <link rel="icon" href={favicon} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDesc} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
