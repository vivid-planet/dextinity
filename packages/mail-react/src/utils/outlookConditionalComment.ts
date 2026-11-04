/** Starts a region that classic Outlook does not render. Close it with `hideFromOutlookEndComment`. */
export const hideFromOutlookStartComment = "<!--[if !mso]><!-->";

/** Ends a region started with `hideFromOutlookStartComment`. */
export const hideFromOutlookEndComment = "<!--<![endif]-->";

/**
 * Wraps HTML that only classic Outlook should render.
 *
 * The result is one comment. Splitting it into a start and an end marker, the way
 * `hideFromOutlookStartComment` and `hideFromOutlookEndComment` do, makes MJML drop the element
 * between them (https://github.com/mjmlio/mjml/issues/1565).
 */
export function showOnlyInOutlook(html: string): string {
    return `<!--[if mso]>${html}<![endif]-->`;
}
