/**
 * Mails are rendered with react-dom/server, which is only available in the SSR environment
 */
export function loadMailsEntry() {
    return import.meta.viteRsc.loadModule<typeof import("./mailsEntry")>("ssr", "mails");
}
