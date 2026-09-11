// Same file in admin and site

import type { ExternalLinkBlockData } from "../../blocks.generated";

// Messages sent from iFrame -> Admin

export enum SitePreviewIFrameMessageType {
    OpenLink = "OpenLink",
    SitePreviewLocation = "SitePreviewLocation",
}

interface SitePreviewIFrameOpenLinkMessage {
    dextinityType: SitePreviewIFrameMessageType.OpenLink;
    data: {
        link: ExternalLinkBlockData;
    };
}

export interface SitePreviewIFrameLocationMessage {
    dextinityType: SitePreviewIFrameMessageType.SitePreviewLocation;
    data: Pick<Location, "search" | "pathname">;
}

export type SitePreviewIFrameMessage = SitePreviewIFrameOpenLinkMessage | SitePreviewIFrameLocationMessage;
