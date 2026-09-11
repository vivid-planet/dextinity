import { useApolloClient } from "@apollo/client";
import { LocalErrorScopeApolloContext, messages, readClipboardText, useErrorDialog, writeClipboardText } from "@dextinity/admin";
import { type ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import type { ContentScope } from "../../contentScope/Provider";
import { useDamBasePath } from "../../dam/config/damConfig";
import { useDamScope } from "../../dam/config/useDamScope";
import type { GQLDocument, GQLPageQuery, GQLPageQueryVariables } from "../../documents/types";
import { usePageTreeScope } from "../config/usePageTreeScope";
import { usePageTreeConfig } from "../pageTreeConfig";
import { sendPages, type SendPagesOptions } from "./useCopyPastePages/sendPages";
import type { GQLPageTreePageFragment } from "./usePageTree";
import { usePageTreeContext } from "./usePageTreeContext";
import { useProgressDialog } from "./useProgressDialog";

export type PageClipboard = GQLPageTreePageFragment & { document?: GQLDocument | null };

export interface PagesClipboard {
    pages: PageClipboard[];
    scope: ContentScope;
}

/**
 * Typeguard to check if an object is a PagesClipboard Type
 * @param pagesClipboard
 */
function isPagesClipboard(pagesClipboard: PagesClipboard): pagesClipboard is PagesClipboard {
    return (pagesClipboard as PagesClipboard).pages !== undefined;
}

/**
 * Union return type from `getFromClipboard` function.
 * The union discriminator `canPaste` returns either a PagesClipboard data if it could be parsed, otherwise an localized error in form of a ReactNode
 */
type GetFromClipboardResponse = { canPaste: true; content: PagesClipboard } | { canPaste: false; error: ReactNode };

interface UseCopyPastePagesApi {
    /**
     * parallel fetches missing document data and prepares data for clipboard.
     * @param flatPagesTree
     */
    prepareForClipboard: (pages: GQLPageTreePageFragment[]) => Promise<PagesClipboard>;

    /**
     * writes pages to the clipboard.
     * @param pages Use `prepareForClipboard` function to generate this kind of type
     */
    writeToClipboard: (pages: PagesClipboard) => Promise<void>;

    /**
     * read data from clipboard, validate it and return parsed data.
     */
    getFromClipboard: () => Promise<GetFromClipboardResponse>;

    /**
     * @param parentId Parent Id where the paste should be attached to
     * @param pages all pages which should be pasted
     * @param options customize where the pages are pasted
     */
    sendPages: (parentId: string | null, pages: PagesClipboard, options: SendPagesOptions) => Promise<void>;

    progressDialog: ReactNode;
}

/**
 * This hooks provides some helper functions to copy / paste Pages and PageTreeNodes
 */
function useCopyPastePages(): UseCopyPastePagesApi {
    const { apiUrl } = useDextinityConfig();
    const { documentTypes } = usePageTreeConfig();
    const { currentCategory } = usePageTreeContext();
    const client = useApolloClient();
    const scope = usePageTreeScope();
    const damScope = useDamScope();
    const progress = useProgressDialog({ title: <FormattedMessage id="dextinity.pages.insertingPages" defaultMessage="Inserting pages" /> });
    const errorDialog = useErrorDialog();
    const damBasePath = useDamBasePath();

    const prepareForClipboard = useCallback(
        async (pages: GQLPageTreePageFragment[]): Promise<PagesClipboard> => {
            const pagesWithDocuments: Array<PageClipboard> = [];

            await Promise.all(
                pages.map(async (page) => {
                    const documentType = documentTypes[page.documentType];

                    if (!documentType) {
                        throw new Error(`Unknown document type "${documentType}"`);
                    }

                    try {
                        const query = documentType.getQuery;

                        if (query) {
                            const { data } = await client.query<GQLPageQuery, GQLPageQueryVariables>({
                                query,
                                variables: {
                                    id: page.id,
                                },
                                context: LocalErrorScopeApolloContext,
                            });

                            const clipboardPage: PageClipboard = { ...page, document: data?.page?.document };
                            pagesWithDocuments.push(clipboardPage);
                        }
                    } catch {
                        throw new Error(`Error while fetching page`);
                    }
                }),
            );

            const clipboardPages: PagesClipboard = {
                pages: [...pagesWithDocuments],
                scope,
            };
            return clipboardPages;
        },
        [client, documentTypes, scope],
    );
    const writeToClipboard = useCallback(async (pages: PagesClipboard) => {
        return writeClipboardText(JSON.stringify(pages));
    }, []);

    const getFromClipboard = async (): Promise<GetFromClipboardResponse> => {
        const text = await readClipboardText();

        if (text === undefined) {
            return {
                canPaste: false,
                error: (
                    <FormattedMessage
                        id="dextinity.pages.cannotPastePage.messageFailedToReadClipboard"
                        defaultMessage="Can't read clipboard content. Please make sure that clipboard access is given"
                    />
                ),
            };
        }

        if (text.trim() === "") {
            return {
                canPaste: false,
                error: <FormattedMessage id="dextinity.pages.cannotPastePage.messageEmptyClipboard" defaultMessage="Clipboard is empty" />,
            };
        }

        try {
            const parsedText = JSON.parse(text);
            if (isPagesClipboard(parsedText)) {
                return { canPaste: true, content: parsedText };
            } else {
                return {
                    canPaste: false,
                    error: (
                        <FormattedMessage
                            id="dextinity.pages.cannotPasteBlock.messageFailedToParseClipboard"
                            defaultMessage="Content from clipboard aren't valid blocks"
                        />
                    ),
                };
            }
        } catch {
            return {
                canPaste: false,
                error: (
                    <FormattedMessage
                        id="dextinity.pages.cannotPasteBlock.messageFailedToParseClipboard"
                        defaultMessage="Content from clipboard aren't valid blocks"
                    />
                ),
            };
        }
    };

    const updateProgress = progress.updateProgress;
    const sendPagesCb = useCallback(
        async (parentId: string | null, pages: PagesClipboard, options: SendPagesOptions) => {
            try {
                await sendPages(
                    parentId,
                    pages,
                    options,
                    { client, scope, documentTypes, apiUrl, damScope, currentCategory, damBasePath },
                    updateProgress,
                );
            } catch (e) {
                errorDialog?.showError({
                    title: <FormattedMessage {...messages.error} />,
                    userMessage: (
                        <FormattedMessage id="dextinity.pages.cannotPastePage" defaultMessage="An unexpected error occurred when pasting pages." />
                    ),
                    error: String(e),
                });
            } finally {
                updateProgress(undefined); //hides progress dialog
            }
        },
        [client, scope, documentTypes, apiUrl, damScope, currentCategory, updateProgress, errorDialog, damBasePath],
    );

    return {
        prepareForClipboard,
        writeToClipboard,
        getFromClipboard,
        sendPages: sendPagesCb,
        progressDialog: progress.dialog,
    };
}

export { useCopyPastePages };
