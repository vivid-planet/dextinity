import type { SitePreviewIFrameMessage } from "./SitePreviewIFrameMessage";

export function sendSitePreviewIFrameMessage(message: SitePreviewIFrameMessage) {
    window.parent.postMessage(JSON.stringify(message), "*");
}
