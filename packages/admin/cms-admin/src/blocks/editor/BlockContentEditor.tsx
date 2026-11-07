import { RouteWithErrorBoundary } from "@dextinity/admin";
import { EditLayout, type EditLayoutPane, Icon, Panel, SegmentedControl } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type PropsWithChildren, type ReactNode, useState } from "react";
import { useIntl } from "react-intl";
import { Switch } from "react-router";

import { UnsavedChangesPrompt } from "../../pages/editor/UnsavedChangesPrompt";
import { useEditorTabRoute } from "../../pages/editor/useEditorTabRoute";
import { useSavePageShortcut } from "../../pages/useSavePageShortcut";
import { BlockPreviewPane } from "../../preview/block/BlockPreviewPane";
import { type BlockPreviewApi, useBlockPreview } from "../../preview/block/useBlockPreview";
import { useScrollRestoration } from "../common/useScrollRestoration";
import { IFrameBridgeProvider } from "../iframebridge/IFrameBridge";
import { EditorTabBar } from "./EditorTabBar";

/** What the preview of a block editor shows: the site's block preview page and the unsaved state of the root block shown there. */
export interface BlockContentEditorPreview {
    /** The address of the site's block preview page, e.g. `${blockPreviewBaseUrl}/page`. */
    url: string;
    /** The state to render, created with the root block's `createPreviewState`. */
    state: unknown;
    /** The public address of the edited content, shown above the preview. Defaults to `url`. `null` shows no address, e.g. for content without its own page. */
    siteUrl?: string | null;
}

export interface BlockContentEditorTab {
    /** The tab's route below the editor's URL. The first tab is shown at the editor's URL itself. */
    key: string;
    label: string;
    /** The tab's content, e.g. the `adminUI` of a root block wrapped in `BlockAdminComponentRoot`, or form fields. */
    content: ReactNode;
    /** Marks the tab as containing errors, e.g. when its root block is invalid. */
    invalid?: boolean;
    /** What the preview shows while this tab is selected. Defaults to the editor's `preview`. */
    preview?: BlockContentEditorPreview;
}

/** Saving the edited content, which the editor offers before leaving with unsaved changes and with ⌘S / Ctrl+S. */
export interface BlockContentEditorSave {
    hasChanges: boolean;
    saving: boolean;
    /** Saves the content. Resolves `false` when it wasn't saved, e.g. because it is invalid, which keeps the user in the editor. */
    onSave: () => Promise<boolean>;
    /** Discards the unsaved changes before leaving. */
    onDiscard: () => void;
}

export interface BlockContentEditorProps {
    /** The header above editor and preview, e.g. a `PageHeader` with the save state and Save as the only primary action. */
    header: ReactNode;
    /** The editor's tabs, each a route below the editor's URL, e.g. Content and Settings. A single tab is shown without a tab bar. */
    tabs: BlockContentEditorTab[];
    /** What the preview shows for tabs without their own `preview`. Without any preview, the editor is a form. */
    preview?: BlockContentEditorPreview;
    /** The device and visibility settings of the preview, from `useBlockPreview`. Pass them when creating the preview state uses them. */
    previewApi?: BlockPreviewApi;
    /** Opens the saved content in the site, e.g. in a new tab. Without it, the preview doesn't offer it. */
    onOpenSitePreview?: () => void;
    /** Further actions at the end of the preview's toolbar. */
    previewActions?: ReactNode;
    /** Shows placeholders instead of editor and preview while the content loads. */
    loading?: boolean;
    /** Asks to save or discard unsaved changes before leaving the editor and saves with ⌘S / Ctrl+S. */
    save?: BlockContentEditorSave;
}

/**
 * The editor of content made of blocks in the edit layout of `@dextinity/ui`: the header, the live preview on the left, and the panel with
 * the tabs on the right. Each tab is a route, so blocks can open nested routes and tabs can be deep-linked. Used by the page editor and
 * for other block documents, e.g. emails. The children are rendered after the layout, e.g. dialogs and a `ToastViewport`.
 */
export function BlockContentEditor({
    header,
    tabs,
    preview,
    previewApi: previewApiProp,
    onOpenSitePreview,
    previewActions,
    loading = false,
    save,
    children,
}: PropsWithChildren<BlockContentEditorProps>) {
    const intl = useIntl();
    const fallbackPreviewApi = useBlockPreview();
    const previewApi = previewApiProp ?? fallbackPreviewApi;
    const [pane, setPane] = useState<EditLayoutPane>("editor");

    useSavePageShortcut(save?.onSave ?? noSave, { hasChanges: save?.hasChanges, saving: save?.saving ?? false, enabled: save != null });

    const { selectedKey, editorUrl, getTabUrl } = useEditorTabRoute(tabs.map((tab) => tab.key));
    const selectedTab = tabs.find((tab) => tab.key === selectedKey);
    const activePreview = selectedTab?.preview ?? preview;
    const scrollRestoration = useScrollRestoration<HTMLDivElement>(`pageContentEditor-${selectedKey}`);

    const editor = (
        <EditorPanel padding="none" data-preview={activePreview != null ? "" : undefined}>
            {tabs.length > 1 && <EditorTabBar tabs={tabs} selectedKey={selectedKey} getTabUrl={getTabUrl} />}
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
        <IFrameBridgeProvider>
            {save != null && (
                <UnsavedChangesPrompt hasChanges={save.hasChanges} onSave={save.onSave} onDiscard={save.onDiscard} allowWithin={editorUrl} />
            )}
            <EditLayout
                variant={preview != null || tabs.some((tab) => tab.preview != null) ? "page" : "form"}
                header={header}
                loading={loading}
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
                            onOpenSitePreview={onOpenSitePreview}
                            actions={previewActions}
                        />
                    ) : undefined
                }
            >
                {editor}
            </EditLayout>
            {children}
        </IFrameBridgeProvider>
    );
}

async function noSave() {
    return false;
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

const TabContent = styled("div")`
    flex: 1;
    min-block-size: 0;
    overflow: hidden auto;
    padding: var(--dextinity-panel-padding);

    // A form without a preview spans the page, where the narrow padding of the side panel looks cramped
    [data-variant="form"] & {
        padding: var(--dextinity-edit-layout-gap);
    }
`;
