import { Stack, StackPage, StackSwitch, StackToolbar } from "@dextinity/admin";
import { Document, LinkExternal } from "@dextinity/admin-icons";
import type { ComponentType, JSX } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { ExternalLinkBlock } from "../blocks/ExternalLinkBlock";
import { createOneOfBlock } from "../blocks/factories/createOneOfBlock";
import { InternalLinkBlock } from "../blocks/InternalLinkBlock";
import type { BlockInterface } from "../blocks/types";
import { ContentScopeIndicator } from "../contentScope/ContentScopeIndicator";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { RedirectForm } from "./RedirectForm";
import { useRedirectsScope } from "./redirectsConfig";
import { RedirectsGrid } from "./RedirectsGrid";

const RedirectsInternalLinkBlock: typeof InternalLinkBlock = {
    ...InternalLinkBlock,
    previewContent: (state) => [...(state.targetPage?.path ? [{ type: "text" as const, content: state.targetPage.path }] : [])],
    icon: (state) => state.targetPage && <Document color="primary" />,
    dynamicDisplayName: (state) => state.targetPage?.name ?? InternalLinkBlock.displayName,
};

const RedirectsExternalLinkBlock: typeof ExternalLinkBlock = {
    ...ExternalLinkBlock,
    previewContent: (state) => [...(state.targetUrl ? [{ type: "text" as const, content: ExternalLinkBlock.displayName }] : [])],
    icon: (state) => state.targetUrl && <LinkExternal color="primary" />,
    dynamicDisplayName: (state) => state.targetUrl ?? ExternalLinkBlock.displayName,
};

interface RedirectsPageProps {
    redirectPathAfterChange?: string;
}

interface CreateRedirectsPageOptions {
    linkBlock?: BlockInterface;
}

export function createRedirectsLinkBlock(customTargets?: Record<string, BlockInterface>) {
    return createOneOfBlock({
        supportedBlocks: { internal: RedirectsInternalLinkBlock, external: RedirectsExternalLinkBlock, ...customTargets },
        name: "RedirectsLink",
        displayName: <FormattedMessage id="dextinity.blocks.link" defaultMessage="Link" />,
        allowEmpty: false,
    });
}

function createRedirectsPage({ linkBlock = createRedirectsLinkBlock() }: CreateRedirectsPageOptions = {}): ComponentType<RedirectsPageProps> {
    function Redirects({ redirectPathAfterChange }: RedirectsPageProps): JSX.Element {
        const intl = useIntl();
        useContentScopeConfig({ redirectPathAfterChange });

        const scope = useRedirectsScope();

        const isGlobalScoped = Object.keys(scope).length === 0;

        return (
            <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.pages.redirects", defaultMessage: "Redirects" })}>
                <StackSwitch initialPage="grid">
                    <StackPage name="grid">
                        <StackToolbar scopeIndicator={<ContentScopeIndicator global={isGlobalScoped} scope={isGlobalScoped ? undefined : scope} />} />
                        <RedirectsGrid linkBlock={linkBlock} scope={scope} />
                    </StackPage>
                    <StackPage name="edit" title={intl.formatMessage({ id: "dextinity.pages.redirects.edit", defaultMessage: "edit" })}>
                        {(selectedId: string) => {
                            return <RedirectForm mode="edit" id={selectedId} linkBlock={linkBlock} scope={scope} />;
                        }}
                    </StackPage>
                    <StackPage name="add" title={intl.formatMessage({ id: "dextinity.pages.redirects.create", defaultMessage: "create" })}>
                        {() => {
                            return <RedirectForm mode="add" linkBlock={linkBlock} scope={scope} />;
                        }}
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    }

    return Redirects;
}

export { createRedirectsPage };
