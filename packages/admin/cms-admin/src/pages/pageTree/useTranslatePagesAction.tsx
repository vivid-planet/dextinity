import { gql, useApolloClient } from "@apollo/client";
import { Button, Dialog, messages, useContentTranslationService, useErrorDialog } from "@dextinity/admin";
import { DialogActions, DialogContent, DialogContentText } from "@mui/material";
import { type ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";

import { useContentScope } from "../../contentScope/Provider";
import type { DocumentInterface, GQLDocument } from "../../documents/types";
import type { TranslatableInterface } from "../../translation/TranslatableInterface";
import { findAvailableSlug } from "./findAvailableSlug";
import { transformToSlug } from "./transformToSlug";
import type { PageTreePage } from "./usePageTree";
import { useProgressDialog } from "./useProgressDialog";

function isTranslatable(
    documentType: DocumentInterface,
): documentType is DocumentInterface & TranslatableInterface & Required<Pick<DocumentInterface, "getQuery" | "updateMutation">> {
    return "translateContent" in documentType && !!documentType.getQuery && !!documentType.updateMutation;
}

interface Props {
    pages: PageTreePage[];
    documentTypes: Record<string, DocumentInterface>;
}

export function useTranslatePagesAction({ pages, documentTypes }: Props): {
    dialogs: ReactNode;
    translating: boolean;
    enabled: boolean;
    hasTranslatableContent: boolean;
    openDialog: () => void;
} {
    const apolloClient = useApolloClient();
    const { enabled, translate, batchTranslate } = useContentTranslationService();
    const { scope } = useContentScope();
    const errorDialog = useErrorDialog();
    const [translating, setTranslating] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const progress = useProgressDialog({
        title: <FormattedMessage id="dextinity.translator.progress.title" defaultMessage="Translating pages" />,
    });

    const eligiblePages = pages.filter((page) => page.visibility !== "Archived");
    const hasTranslatableContent = eligiblePages.some((page) => {
        const documentType = documentTypes[page.documentType];
        return documentType && isTranslatable(documentType);
    });

    const handleTranslate = async () => {
        setConfirmDialogOpen(false);
        setTranslating(true);

        const effectiveBatchTranslate = batchTranslate ?? (async (texts: string[]) => Promise.all(texts.map(translate)));

        try {
            for (let i = 0; i < eligiblePages.length; i++) {
                const page = eligiblePages[i];
                const documentType = documentTypes[page.documentType];
                const hasTranslatableContent = documentType && isTranslatable(documentType);

                progress.updateProgress(
                    (i / eligiblePages.length) * 100,
                    <FormattedMessage
                        id="dextinity.translator.progress.message"
                        defaultMessage="Translating {current} of {total}: {name}"
                        values={{ current: i + 1, total: eligiblePages.length, name: page.name }}
                    />,
                );

                const shouldTranslateName = hasTranslatableContent && page.slug !== "home";

                // Pass 1: Collect all translatable texts
                const collectedTexts: string[] = shouldTranslateName ? [page.name] : [];

                let documentInput: Record<string, unknown> | undefined;
                let documentId: string | undefined;

                if (hasTranslatableContent) {
                    const { data: pageData } = await apolloClient.query({
                        query: documentType.getQuery,
                        variables: { id: page.id },
                        fetchPolicy: "network-only",
                    });

                    const document = pageData?.page?.document;
                    if (document) {
                        const { __typename: _, id, updatedAt: _updatedAt, ...input } = document as GQLDocument;
                        documentInput = input;
                        documentId = id;

                        await documentType.translateContent(documentInput, async (text) => {
                            collectedTexts.push(text);
                            return text;
                        });
                    }
                }

                if (collectedTexts.length === 0) {
                    continue;
                }

                // Pass 2: Batch translate all texts together
                const translatedTexts = await effectiveBatchTranslate(collectedTexts);

                // Pass 3: Apply translations
                let translatedContentTexts: string[];
                if (shouldTranslateName) {
                    const [translatedName, ...rest] = translatedTexts;
                    translatedContentTexts = rest;

                    const translatedSlug = transformToSlug(translatedName, scope.language);

                    if (translatedName !== page.name || translatedSlug !== page.slug) {
                        const available = await findAvailableSlug(apolloClient, {
                            slug: translatedSlug,
                            name: translatedName,
                            parentId: page.parentId,
                            scope,
                        });
                        await apolloClient.mutate({
                            mutation: updatePageTreeNodeMutation,
                            variables: {
                                id: page.id,
                                input: { name: available.name, slug: available.slug },
                            },
                        });
                    }
                } else {
                    translatedContentTexts = translatedTexts;
                }

                if (hasTranslatableContent && documentInput && documentId) {
                    let textIndex = 0;
                    const translatedOutput = await documentType.translateContent(documentInput, async () => {
                        return translatedContentTexts[textIndex++];
                    });

                    await apolloClient.mutate({
                        mutation: documentType.updateMutation,
                        variables: {
                            pageId: documentId,
                            input: translatedOutput,
                            attachedPageTreeNodeId: page.id,
                        },
                    });
                }
            }

            progress.updateProgress(undefined);
            await apolloClient.refetchQueries({ include: ["Pages"] });
        } catch (error) {
            progress.updateProgress(undefined);
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

    const isSinglePage = eligiblePages.length === 1;

    const dialogs = (
        <>
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                title={
                    isSinglePage ? (
                        <FormattedMessage id="dextinity.translator.confirmDialog.title" defaultMessage="Translate page content?" />
                    ) : (
                        <FormattedMessage
                            id="dextinity.translator.confirmDialog.titleMultiple"
                            defaultMessage="Translate {count} pages?"
                            values={{ count: eligiblePages.length }}
                        />
                    )
                }
            >
                <DialogContent>
                    <DialogContentText>
                        {isSinglePage ? (
                            <FormattedMessage
                                id="dextinity.translator.confirmDialog.message"
                                defaultMessage="All text content of this page will be translated. This action cannot be reverted."
                            />
                        ) : (
                            <FormattedMessage
                                id="dextinity.translator.confirmDialog.messageMultiple"
                                defaultMessage="All text content of {count} pages will be translated. This action cannot be reverted."
                                values={{ count: eligiblePages.length }}
                            />
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} variant="textDark">
                        <FormattedMessage {...messages.cancel} />
                    </Button>
                    <Button onClick={handleTranslate} variant="primary">
                        <FormattedMessage id="dextinity.translator.confirmDialog.confirm" defaultMessage="Translate" />
                    </Button>
                </DialogActions>
            </Dialog>
            {progress.dialog}
        </>
    );

    return { dialogs, translating, enabled, hasTranslatableContent, openDialog: () => setConfirmDialogOpen(true) };
}

const updatePageTreeNodeMutation = gql`
    mutation TranslatePageTreeNode($id: ID!, $input: PageTreeNodeUpdateInput!) {
        updatePageTreeNode(id: $id, input: $input) {
            id
            name
            slug
        }
    }
`;
