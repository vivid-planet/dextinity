const cssAttributePattern = /(?<=\s)(font-family|style)="([^"]*)"/g;
const doubleQuotedCssStringPattern = /&quot;(.*?)&quot;/g;

// MJML's CSS inliner reads the `;` of `&#x27;` and `&quot;`, which React writes for quotes, as the end of a declaration and throws.
export function replaceQuoteEntitiesInCssAttributes(mjml: string): string {
    return mjml.replace(cssAttributePattern, (_attribute, name: string, value: string) => `${name}="${replaceQuoteEntities(value)}"`);
}

function replaceQuoteEntities(cssValue: string): string {
    return cssValue
        .replace(doubleQuotedCssStringPattern, (_cssString, content: string) => `'${content.replaceAll("&#x27;", "\\'")}'`)
        .replaceAll("&#x27;", "'");
}
