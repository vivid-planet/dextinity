import { Icon } from "@dextinity/ui";
import type { ComponentType, JSX } from "react";
import { FormattedMessage } from "react-intl";
import { Redirect, Route, Switch, useRouteMatch } from "react-router";

import { createExternalLinkBlock } from "../blocks/createExternalLinkBlock";
import { createOneOfBlock } from "../blocks/factories/createOneOfBlock";
import { InternalLinkBlock } from "../blocks/InternalLinkBlock";
import type { BlockInterface } from "../blocks/types";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { useRedirectsScope } from "./redirectsConfig";
import { RedirectsListPage } from "./RedirectsListPage";

const RedirectsInternalLinkBlock: typeof InternalLinkBlock = {
    ...InternalLinkBlock,
    previewContent: (state) => [...(state.targetPage?.path ? [{ type: "text" as const, content: state.targetPage.path }] : [])],
    icon: (state) => state.targetPage && <Icon name="file" />,
    dynamicDisplayName: (state) => state.targetPage?.name ?? InternalLinkBlock.displayName,
};

const RedirectsExternalLinkBlock = createExternalLinkBlock({ name: "RedirectsExternalLink", openInNewWindow: false, noFollow: false }, (block) => ({
    ...block,
    previewContent: (state) => [...(state.targetUrl ? [{ type: "text" as const, content: block.displayName }] : [])],
    icon: (state) => state.targetUrl && <Icon name="open-new-tab" />,
    dynamicDisplayName: (state) => state.targetUrl ?? block.displayName,
}));

interface RedirectsPageProps {
    /** Where to go after the content scope was changed. */
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
        label: <FormattedMessage id="dextinity.blocks.link.linkType" defaultMessage="Link type" />,
        allowEmpty: false,
    });
}

/**
 * Creates the redirects page: the list of the scope's redirects, with the open redirect edited in a side panel. The open redirect is
 * kept in the URL as `?selected=<id>`; the former edit URLs (`<path>/<id>/edit`) are forwarded there.
 */
function createRedirectsPage({ linkBlock = createRedirectsLinkBlock() }: CreateRedirectsPageOptions = {}): ComponentType<RedirectsPageProps> {
    function Redirects({ redirectPathAfterChange }: RedirectsPageProps): JSX.Element {
        const match = useRouteMatch();
        useContentScopeConfig({ redirectPathAfterChange });
        const scope = useRedirectsScope();

        return (
            <Switch>
                <Route
                    path={`${match.path}/:id/:pageName(edit|add)`}
                    render={({ match: legacyMatch }) => {
                        const selected = legacyMatch.params.pageName === "add" ? "new" : legacyMatch.params.id;
                        return <Redirect to={`${match.url}?selected=${encodeURIComponent(selected)}`} />;
                    }}
                />
                <Route>
                    <RedirectsListPage linkBlock={linkBlock} scope={scope} />
                </Route>
            </Switch>
        );
    }

    return Redirects;
}

export { createRedirectsPage };
