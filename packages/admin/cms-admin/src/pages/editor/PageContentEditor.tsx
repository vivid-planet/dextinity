import { useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import { Icon, MenuItem, type SaveStateValue, ToastViewport, useToasts } from "@dextinity/ui";
import { type ReactNode, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { BlockContentEditor, type BlockContentEditorPreview, type BlockContentEditorTab } from "../../blocks/editor/BlockContentEditor";
import { normalizeSiteAddress } from "../../preview/block/normalizeSiteAddress";
import type { BlockPreviewApi } from "../../preview/block/useBlockPreview";
import { PageEditorHeader } from "./PageEditorHeader";
import { useEditorTabRoute } from "./useEditorTabRoute";
import { usePageEditorHeader } from "./usePageEditorHeader";

/** What the preview of a page editor shows: the site's block preview page and the unsaved state of the root block shown there. */
export type PageContentEditorPreview = BlockContentEditorPreview;

export type PageContentEditorTab = BlockContentEditorTab;

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
export function PageContentEditor({ pageId, pageApi, tabs, preview, previewApi, moreActions }: PageContentEditorProps) {
    const intl = useIntl();
    const { headerProps, openSitePreview } = usePageEditorHeader(pageId);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const translationService = useContentTranslationService();
    const errorDialog = useErrorDialog();
    const [translating, setTranslating] = useState(false);
    const { hasChanges = false, saving, handleSavePage } = pageApi;
    const { selectedKey } = useEditorTabRoute(tabs.map((tab) => tab.key));
    const selectedTab = tabs.find((tab) => tab.key === selectedKey);
    const activePreview = selectedTab?.preview ?? preview;

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

    return (
        <BlockContentEditor
            header={header}
            tabs={tabs}
            preview={preview}
            previewApi={previewApi}
            onOpenSitePreview={openSitePreview}
            loading={!isLoaded}
            save={{ hasChanges, saving, onSave: saveAndReportSuccess, onDiscard: () => void pageApi.resetPageStateToLatest() }}
        >
            {pageApi.dialogs}
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.pageEditor.notifications", defaultMessage: "Notifications" }) }}
            />
        </BlockContentEditor>
    );
}
