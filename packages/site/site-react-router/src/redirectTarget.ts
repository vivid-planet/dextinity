const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];

// Relative targets resolve to the http(s) URL of the page
const relativeBase = "http://relative.invalid";

/**
 * Only allows targets the browser can safely navigate to, e.g. no `javascript:` URLs from redirect entries of the CMS
 */
export function isAllowedRedirectTarget(location: string): boolean {
    return URL.canParse(location, relativeBase) && allowedProtocols.includes(new URL(location, relativeBase).protocol);
}
