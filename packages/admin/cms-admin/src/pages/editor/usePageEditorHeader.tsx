import { useStackApi } from "@dextinity/admin";
import type { PageHeaderBack } from "@dextinity/ui";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import { usePageName } from "../../common/PageName";
import { useRouterLinkClick } from "../../common/useRouterLinkClick";
import { useContentScope } from "../../contentScope/Provider";
import { getContentScopeLabel } from "../../contentScope/utils/getContentScopeLabel";
import { openSitePreviewWindow } from "../../preview/openSitePreviewWindow";
import { usePageEditorContext } from "../treeDetail/PageEditorContext";
import type { PageEditorHeaderProps } from "./PageEditorHeader";

export type PageEditorHeaderPageProps = Pick<PageEditorHeaderProps, "title" | "back" | "onBackClick" | "eyebrow" | "visibility" | "path">;

export interface PageEditorHeaderPage {
    /** The props of `PageEditorHeader` that describe the page: name, back link, kind and scope, status and path. */
    headerProps: PageEditorHeaderPageProps;
    /** Opens the page on the site in a new window. Undefined while the page's path is loading. */
    openSitePreview?: () => void;
}

/**
 * The page a page editor edits, as `PageEditorHeader` shows it. Inside the page tree, the back link leads to the page tree and the eyebrow
 * names the kind of document; elsewhere, the back link goes back in the stack. For editors of documents without blocks, e.g. a form for a
 * predefined page, that show the same header as `PageContentEditor`.
 */
export function usePageEditorHeader(pageId: string): PageEditorHeaderPage {
    const intl = useIntl();
    const history = useHistory();
    const stackApi = useStackApi();
    const editorContext = usePageEditorContext();
    const loadedPage = usePageName(pageId, { skip: editorContext != null });
    const contentScope = useContentScope();
    const navigateWithRouter = useRouterLinkClick();

    const path = editorContext?.page.path ?? loadedPage?.path;
    const scopeLabel = getContentScopeLabel({ scope: contentScope.scope, values: contentScope.values });

    let back: PageHeaderBack | undefined;
    if (editorContext != null) {
        back = {
            label: intl.formatMessage({ id: "dextinity.pageEditor.back", defaultMessage: "Page tree" }),
            href: history.createHref({ pathname: editorContext.backUrl }),
        };
    } else if (stackApi != null) {
        back = {
            label: intl.formatMessage({ id: "dextinity.pageEditor.backGeneric", defaultMessage: "Back" }),
            href: "#",
            onClick: stackApi.goBack,
        };
    }

    return {
        headerProps: {
            title: editorContext?.page.name ?? loadedPage?.name,
            back,
            onBackClick: editorContext != null ? navigateWithRouter : undefined,
            eyebrow:
                editorContext != null ? (
                    <>
                        {editorContext.documentType.displayName}
                        {eyebrowSeparator}
                        {scopeLabel}
                    </>
                ) : (
                    scopeLabel
                ),
            visibility: editorContext?.page.visibility,
            path,
        },
        openSitePreview: path != null ? () => openSitePreviewWindow(path, contentScope.match.url) : undefined,
    };
}

const eyebrowSeparator = " · ";
