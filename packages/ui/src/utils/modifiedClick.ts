/**
 * Whether a click on a link asks the browser to open it elsewhere — in a new tab or window, or as a download — rather than in
 * place: a modifier key is held or a button other than the primary one was used.
 */
export function isModifiedClick(event: Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">): boolean {
    return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}
