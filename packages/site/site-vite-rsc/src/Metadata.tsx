type MetadataProps = {
    /** Relative URLs are resolved against it, e.g. the URL of the site, as crawlers and share previews need absolute URLs */
    baseUrl: string;
    description?: string;
    noIndex?: boolean;
    /** Also used as `og:url` */
    canonicalUrl?: string;
    alternateLinks?: Array<{ hrefLang: string; url: string }>;
    openGraphTitle?: string;
    openGraphDescription?: string;
    openGraphImageUrl?: string;
    /** Defaults to `website` */
    openGraphType?: string;
};

const urlWithSchemeRegex = /^[a-z][a-z\d+.-]*:/i;

function resolveUrl(url: string, baseUrl: string) {
    return urlWithSchemeRegex.test(url) ? url : new URL(url, baseUrl).href;
}

/**
 * Renders the metadata of a page, React hoists the elements into the `<head>`. The page renders its `<title>` itself.
 */
export function Metadata({
    baseUrl,
    description,
    noIndex,
    canonicalUrl,
    alternateLinks = [],
    openGraphTitle,
    openGraphDescription,
    openGraphImageUrl,
    openGraphType = "website",
}: MetadataProps) {
    return (
        <>
            {description && <meta name="description" content={description} />}
            <meta name="robots" content={noIndex ? "noindex" : "index"} />
            {canonicalUrl && <link rel="canonical" href={resolveUrl(canonicalUrl, baseUrl)} />}
            {alternateLinks.map((link) => (
                <link key={link.hrefLang} rel="alternate" hrefLang={link.hrefLang} href={resolveUrl(link.url, baseUrl)} />
            ))}
            {openGraphTitle && <meta property="og:title" content={openGraphTitle} />}
            {openGraphDescription && <meta property="og:description" content={openGraphDescription} />}
            {canonicalUrl && <meta property="og:url" content={resolveUrl(canonicalUrl, baseUrl)} />}
            {openGraphImageUrl && <meta property="og:image" content={resolveUrl(openGraphImageUrl, baseUrl)} />}
            <meta property="og:type" content={openGraphType} />
        </>
    );
}
