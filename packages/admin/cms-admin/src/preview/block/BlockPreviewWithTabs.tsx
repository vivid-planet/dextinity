import { BlockAdminTabs } from "../../blocks/common/BlockAdminTabs";
import { IFrameBridgeProvider } from "../../blocks/iframebridge/IFrameBridge";
import type { BlockAdminComponentPart } from "../../blocks/types";
import { SplitPreview } from "./SplitPreview";
import type { BlockPreviewApi } from "./useBlockPreview";

interface Props {
    previewApi: BlockPreviewApi;
    children: BlockAdminComponentPart[];
    previewState: unknown;
    previewUrl: string;
    /** See `BlockPreview` */
    contentScopeJwt?: string;
}

function BlockPreviewWithTabs({ children, previewApi, previewState, previewUrl, contentScopeJwt }: Props) {
    let pageContent = null;

    if (previewApi.minimized) {
        const [firstTab, ...otherTabs] = children;

        pageContent = [firstTab.content, <BlockAdminTabs key="1">{otherTabs}</BlockAdminTabs>];
    } else {
        pageContent = <BlockAdminTabs>{children}</BlockAdminTabs>;
    }

    return (
        <IFrameBridgeProvider key={previewUrl}>
            <SplitPreview url={previewUrl} previewState={previewState} previewApi={previewApi} contentScopeJwt={contentScopeJwt}>
                {pageContent}
            </SplitPreview>
        </IFrameBridgeProvider>
    );
}

export { BlockPreviewWithTabs };
