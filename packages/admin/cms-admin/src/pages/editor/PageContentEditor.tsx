import { RouteWithErrorBoundary, useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import {
    EditLayout,
    type EditLayoutPane,
    Icon,
    MenuItem,
    Panel,
    type SaveStateValue,
    SegmentedControl,
    Tabs,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type ReactNode, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Switch } from "react-router";

import { useScrollRestoration } from "../../blocks/common/useScrollRestoration";
import { IFrameBridgeProvider } from "../../blocks/iframebridge/IFrameBridge";
import { RouterTabLink } from "../../common/RouterTabLink";
import { BlockPreviewPane } from "../../preview/block/BlockPreviewPane";
import { normalizeSiteAddress } from "../../preview/block/normalizeSiteAddress";
import { type BlockPreviewApi, useBlockPreview } from "../../preview/block/useBlockPreview";
import { useSavePageShortcut } from "../useSavePageShortcut";
import { PageEditorHeader } from "./PageEditorHeader";
import { UnsavedChangesPrompt } from "./UnsavedChangesPrompt";
import { useEditorTabRoute } from "./useEditorTabRoute";
import { usePageEditorHeader } from "./usePageEditorHeader";

/** What the preview of a page editor shows: the site's block preview page and the unsaved state of the root block shown there. */
export interface PageContentEditorPreview {
    /** The address of the site's block preview page, e.g. `${blockPreviewBaseUrl}/page`. */
    url: string;
    /** The state to render, created with the root block's `createPreviewState`. */
    state: unknown;
    /** The public address of the edited page, shown above the preview and copied with "Copy address". */
    siteUrl?: string;
}

export interface PageContentEditorTab {
    /** The tab's route below the editor's URL. The first tab is shown at the editor's URL itself. */
    key: string;
    label: string;
    /** The tab's content, e.g. the `adminUI` of a root block wrapped in `BlockAdminComponentRoot`. */
    content: ReactNode;
    /** Marks the tab as containing errors, e.g. when its root block is invalid. */
    invalid?: boolean;
    /** What the preview shows while this tab is selected. Defaults to the editor's `preview`. */
    preview?: PageContentEditorPreview;
}

/** The parts of the `createUsePage` hook's result the editor uses. Pass the result as it is. */
export interface PageContentEditorPageApi {
    pageState?: { document?: unknown };
    hasChanges?: boolean;
    saving: boolean;
    saveError?: "invalid" | "conflict" | "error";
    saveState: SaveStateValue;
    savedAt?: Date;
    /** Saves the page. Resolves `false` when the page wasn't saved, e.g. because it is invalid or has a save conflict. */
    handleSavePage: () => Promise<boolean | void>;
    resetPageStateToLatest: () => Promise<void>;
    translateContent: (batchTranslate: (texts: string[]) => Promise<string[]>) => Promise<void>;
    dialogs: ReactNode;
}

export interface PageContentEditorProps {
    /** The id of the page tree node whose document is edited. */
    pageId: string;
    /** The result of the hook created with `createUsePage`. */
    pageApi: PageContentEditorPageApi;
    /** The editor's tabs, each a route below the editor's URL, e.g. Blocks, Stage, SEO, Dependents, and Dependencies. */
    tabs: PageContentEditorTab[];
    /** What the preview shows for tabs without their own `preview`. Without any preview, the editor is a form, e.g. for links. */
    preview?: PageContentEditorPreview;
    /** The device and visibility settings of the preview, from `useBlockPreview`. Pass them when creating the preview state uses them. */
    previewApi?: BlockPreviewApi;
    /** Further entries of the "More actions" menu, `MenuItem`s of `@dextinity/ui`. */
    moreActions?: ReactNode;
}

/**
 * The editor of a page's document in the edit layout of `@dextinity/ui`: the header with the page's status and Save, the live preview on the
 * left, and the panel with the tabs on the right. Each tab is a route, so blocks can open nested routes and tabs can be deep-linked.
 * Asks to save or discard unsaved changes before leaving and saves with ⌘S / Ctrl+S.
 */
export function PageContentEditor({ pageId, pageApi, tabs, preview, previewApi: previewApiProp, moreActions }: PageContentEditorProps) {
    const intl = useIntl();
    const { headerProps, openSitePreview } = usePageEditorHeader(pageId);
    const fallbackPreviewApi = useBlockPreview();
    const previewApi = previewApiProp ?? fallbackPreviewApi;
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const translationService = useContentTranslationService();
    const errorDialog = useErrorDialog();
    const [translating, setTranslating] = useState(false);
    const [pane, setPane] = useState<EditLayoutPane>("editor");
    const { hasChanges = false, saving, handleSavePage } = pageApi;

    useSavePageShortcut(handleSavePage, { hasChanges, saving });

    const { selectedKey, editorUrl, getTabUrl } = useEditorTabRoute(tabs.map((tab) => tab.key));
    const selectedTab = tabs.find((tab) => tab.key === selectedKey);
    const activePreview = selectedTab?.preview ?? preview;
    const scrollRestoration = useScrollRestoration<HTMLDivElement>(`pageContentEditor-${selectedKey}`);

    const saveAndReportSuccess = async () => {
        const saved = await handleSavePage();
        return saved !== false;
    };

    const translate = async () => {
        if (!translationService.enabled) {
            return;
        }
        const { translate: translateText, batchTranslate } = translationService;
        setTranslating(true);
        try {
            await pageApi.translateContent(batchTranslate ?? (async (texts: string[]) => Promise.all(texts.map(translateText))));
        } catch (error) {
            errorDialog?.showError({
                title: <FormattedMessage id="dextinity.translator.error.title" defaultMessage="Translation failed" />,
                userMessage: (
                    <FormattedMessage
                        id="dextinity.translator.error.message"
                        defaultMessage="An error occurred while translating the content. Please try again."
                    />
                ),
                error: error instanceof Error ? error.message : "Translation failed",
            });
        } finally {
            setTranslating(false);
        }
    };

    const copySiteAddress = async (siteUrl: string) => {
        try {
            await navigator.clipboard.writeText(normalizeSiteAddress(siteUrl));
            addToast({
                tone: "success",
                message: intl.formatMessage({ id: "dextinity.pageEditor.addressCopied", defaultMessage: "Address copied" }),
            });
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage({ id: "dextinity.pageEditor.addressNotCopied", defaultMessage: "The address couldn't be copied" }),
            });
        }
    };

    const isLoaded = pageApi.pageState?.document != null;

    const menuItems = (
        <>
            {openSitePreview && (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.pageEditor.sitePreview", defaultMessage: "Site preview" })}
                    icon={<Icon name="preview" />}
                    onClick={openSitePreview}
                />
            )}
            {activePreview?.siteUrl != null && (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.pageEditor.copyAddress", defaultMessage: "Copy address" })}
                    icon={<Icon name="copy" />}
                    onClick={() => void copySiteAddress(activePreview.siteUrl as string)}
                />
            )}
            {translationService.enabled && (
                <MenuItem
                    label={intl.formatMessage({ id: "dextinity.translator.translate", defaultMessage: "Translate" })}
                    icon={<Icon name="translate" />}
                    disabled={!isLoaded || translating}
                    onClick={() => void translate()}
                />
            )}
            {moreActions}
        </>
    );

    const header = (
        <PageEditorHeader
            {...headerProps}
            saveState={pageApi.saveState}
            savedAt={pageApi.savedAt}
            hasChanges={hasChanges}
            saving={saving}
            saveError={pageApi.saveError}
            onSave={() => void handleSavePage()}
            menuItems={menuItems}
        />
    );

    const showsTabs = tabs.length > 1;
    const editor = (
        <EditorPanel padding="none" data-preview={activePreview != null ? "" : undefined}>
            {showsTabs && (
                <TabBar
                    aria-label={intl.formatMessage({ id: "dextinity.pageEditor.tabs", defaultMessage: "Editor" })}
                    value={selectedKey ?? ""}
                    onChange={() => {
                        // The tabs are router links, which navigate themselves; the route decides the selected tab
                    }}
                    items={tabs.map((tab) => ({
                        value: tab.key,
                        label: tab.label,
                        href: getTabUrl(tab.key),
                        tone: tab.invalid ? "error" : "default",
                    }))}
                    labels={{ error: intl.formatMessage({ id: "dextinity.pageEditor.tabInvalid", defaultMessage: "Contains errors" }) }}
                    slots={{ tab: RouterTabLink }}
                />
            )}
            <TabContent {...scrollRestoration}>
                <Switch>
                    {tabs.slice(1).map((tab) => (
                        <RouteWithErrorBoundary key={tab.key} path={getTabUrl(tab.key)}>
                            {tab.content}
                        </RouteWithErrorBoundary>
                    ))}
                    {tabs.length > 0 && <RouteWithErrorBoundary path={editorUrl}>{tabs[0].content}</RouteWithErrorBoundary>}
                </Switch>
            </TabContent>
        </EditorPanel>
    );

    return (
        <IFrameBridgeProvider key={activePreview?.url}>
            <UnsavedChangesPrompt
                hasChanges={hasChanges}
                onSave={saveAndReportSuccess}
                onDiscard={() => void pageApi.resetPageStateToLatest()}
                allowWithin={editorUrl}
            />
            <EditLayout
                variant={preview != null || tabs.some((tab) => tab.preview != null) ? "page" : "form"}
                header={header}
                loading={!isLoaded}
                pane={pane}
                paneSwitch={
                    <SegmentedControl
                        aria-label={intl.formatMessage({ id: "dextinity.pageEditor.pane", defaultMessage: "View" })}
                        value={pane}
                        onChange={setPane}
                        options={[
                            {
                                value: "preview",
                                label: intl.formatMessage({ id: "dextinity.pageEditor.pane.preview", defaultMessage: "Preview" }),
                                icon: <Icon name="visible" />,
                            },
                            {
                                value: "editor",
                                label: intl.formatMessage({ id: "dextinity.pageEditor.pane.editor", defaultMessage: "Edit" }),
                                icon: <Icon name="edit" />,
                            },
                        ]}
                    />
                }
                preview={
                    activePreview != null ? (
                        <BlockPreviewPane
                            url={activePreview.url}
                            siteUrl={activePreview.siteUrl}
                            previewState={activePreview.state}
                            previewApi={previewApi}
                            onOpenSitePreview={openSitePreview}
                        />
                    ) : undefined
                }
            >
                {editor}
            </EditLayout>
            {pageApi.dialogs}
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.pageEditor.notifications", defaultMessage: "Notifications" }) }}
            />
        </IFrameBridgeProvider>
    );
}

const EditorPanel = styled(Panel)`
    display: flex;
    flex-direction: column;

    > :last-child {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-block-size: 0;
    }

    &[data-preview] {
        position: sticky;
        inset-block-start: var(--dextinity-edit-layout-sticky-offset);
        block-size: calc(100dvh - var(--dextinity-edit-layout-sticky-offset) - var(--dextinity-edit-layout-preview-spacing));
        min-block-size: var(--dextinity-edit-layout-preview-min-height);
    }
`;

const TabBar = styled(Tabs)`
    flex-shrink: 0;
    padding-inline: var(--dextinity-panel-padding);
    padding-block-start: var(--dextinity-space-2);
` as typeof Tabs;

const TabContent = styled("div")`
    flex: 1;
    min-block-size: 0;
    overflow: hidden auto;
    padding: var(--dextinity-panel-padding);
`;
