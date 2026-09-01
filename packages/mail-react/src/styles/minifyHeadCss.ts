import { syntax } from "csso";

/**
 * Minifies CSS for a `<style>` tag in the mail head.
 *
 * Gmail discards a mail's `<style>` content once the tags together pass 16,384 characters.
 */
export function minifyHeadCss(css: string): string {
    const parseErrors: string[] = [];
    const styleSheet = syntax.parse(css, { onParseError: (error) => parseErrors.push(error.message) });

    if (parseErrors.length > 0) {
        throw new Error(`The registered styles do not parse, so they cannot be minified: ${parseErrors.join("; ")}`);
    }

    return syntax.generate(syntax.compress(styleSheet).ast);
}
