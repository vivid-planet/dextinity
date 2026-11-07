import { gql, useApolloClient } from "@apollo/client";
import { useContentTranslationService } from "@dextinity/admin";
import { Button, ConfirmDialog, Dialog, Icon } from "@dextinity/ui";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import { ProgressDialog } from "../../common/useProgressDialog";
import { useContentLanguage } from "../../contentLanguage/useContentLanguage";
import { useContentScope } from "../../contentScope/Provider";
import type { DocumentInterface, GQLDocument } from "../../documents/types";
import type { TranslatableInterface } from "../../translation/TranslatableInterface";
import { findAvailableSlug } from "./findAvailableSlug";
import { transformToSlug } from "./transformToSlug";
import type { GQLPageTreePageFragment } from "./usePageTree";

function isTranslatable(
    documentType: DocumentInterface,
): documentType is DocumentInterface & TranslatableInterface & Required<Pick<DocumentInterface, "getQuery" | "updateMutation">> {
    return "translateContent" in documentType && !!documentType.getQuery && !!documentType.updateMutation;
}

interface Props {
    pages: GQLPageTreePageFragment[];
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
    const language = useContentLanguage({ scope });
    const intl = useIntl();
    const [translating, setTranslating] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [progress, setProgress] = useState<{ value: number; message: string }>();
    const [errorMessage, setErrorMessage] = useState<string>();

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

                setProgress({
                    value: (i / eligiblePages.length) * 100,
                    message: intl.formatMessage(
                        { id: "dextinity.translator.progress.message", defaultMessage: "Translating {current} of {total}: {name}" },
                        { current: i + 1, total: eligiblePages.length, name: page.name },
                    ),
                });

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

                    const translatedSlug = transformToSlug(translatedName, language);

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

            setProgress(undefined);
            await apolloClient.refetchQueries({ include: ["Pages"] });
        } catch (error) {
            setProgress(undefined);
            setErrorMessage(error instanceof Error ? error.message : undefined);
        } finally {
            setTranslating(false);
        }
    };

    const isSinglePage = eligiblePages.length === 1;

    const dialogs = (
        <>
            <ConfirmDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                title={
                    isSinglePage
                        ? intl.formatMessage({ id: "dextinity.translator.confirmDialog.title", defaultMessage: "Translate page content?" })
                        : intl.formatMessage(
                              { id: "dextinity.translator.confirmDialog.titleMultiple", defaultMessage: "Translate {count} pages?" },
                              { count: eligiblePages.length },
                          )
                }
                description={
                    isSinglePage
                        ? intl.formatMessage({
                              id: "dextinity.translator.confirmDialog.message",
                              defaultMessage: "All text content of this page will be translated. This action cannot be reverted.",
                          })
                        : intl.formatMessage(
                              {
                                  id: "dextinity.translator.confirmDialog.messageMultiple",
                                  defaultMessage: "All text content of {count} pages will be translated. This action cannot be reverted.",
                              },
                              { count: eligiblePages.length },
                          )
                }
                confirmLabel={intl.formatMessage({ id: "dextinity.translator.confirmDialog.confirm", defaultMessage: "Translate" })}
                confirmIcon={<Icon name="translate" />}
                onConfirm={handleTranslate}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.translator.confirmDialog.cancel", defaultMessage: "Cancel" }) }}
            />
            <ProgressDialog
                title={intl.formatMessage({ id: "dextinity.translator.progress.title", defaultMessage: "Translating pages" })}
                progress={progress}
            />
            <Dialog
                open={errorMessage !== undefined}
                onOpenChange={() => setErrorMessage(undefined)}
                role="alertdialog"
                size="small"
                title={intl.formatMessage({ id: "dextinity.translator.error.title", defaultMessage: "Translation failed" })}
                description={intl.formatMessage({
                    id: "dextinity.translator.error.message",
                    defaultMessage: "An error occurred while translating the content. Please try again.",
                })}
                labels={{ close: intl.formatMessage({ id: "dextinity.translator.error.close", defaultMessage: "Close" }) }}
                footer={
                    <Button onClick={() => setErrorMessage(undefined)}>
                        {intl.formatMessage({ id: "dextinity.translator.error.close", defaultMessage: "Close" })}
                    </Button>
                }
            >
                {errorMessage}
            </Dialog>
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
