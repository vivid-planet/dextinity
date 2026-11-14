const safeHrefPattern = /^(https?:|mailto:|tel:|\/|#)/i;

/**
 * Whether a link target is safe to render: http(s), mail, phone, or a relative path.
 */
export function isSafeHref(href: string) {
    return safeHrefPattern.test(href.trim());
}
