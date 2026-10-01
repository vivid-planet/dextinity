// TODO Replace with `id` on `mj-body` once the package moves to MJML 5.
export function addBodyTargetingId(html: string): string {
    return html.replace(/<body(?=[\s>])/, '<body id="body"');
}
