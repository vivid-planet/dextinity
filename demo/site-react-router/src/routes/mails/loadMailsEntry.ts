/**
 * The mails are rendered with react-dom/server and client React (e.g. contexts), which aren't available in the React Server Components environment of the routes
 */
export function loadMailsEntry() {
    return import.meta.viteRsc.loadModule<typeof import("./mailsEntry")>("ssr", "mails");
}
