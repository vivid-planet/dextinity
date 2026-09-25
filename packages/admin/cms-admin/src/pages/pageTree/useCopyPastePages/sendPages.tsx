import { type ApolloClient, gql } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import isEqual from "lodash.isequal";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { v4 as uuid } from "uuid";

import { createUndefinedReplacementsForDependencies } from "../../../blocks/helpers/createUndefinedReplacementsForDependencies";
import type { ReplaceDependencyObject } from "../../../blocks/types";
import type { ContentScope } from "../../../contentScope/Provider";
import { copyDamFilesToScope, type DamFileToCopy } from "../../../dam/copyFilesToScope/copyDamFilesToScope";
import { damFilesFromDependencies, isDamFileDependency } from "../../../dam/copyFilesToScope/damFileDependencies";
import type { DocumentInterface, GQLDocument, GQLUpdatePageMutationVariables } from "../../../documents/types";
import type { PageTreeConfig } from "../../pageTreeConfig";
import { findAvailableSlug } from "../findAvailableSlug";
import { arrayToTreeMap } from "../treemap/TreeMapUtils";
import type { PageClipboard, PagesClipboard } from "../useCopyPastePages";
import type { GQLCreatePageNodeMutation, GQLCreatePageNodeMutationVariables } from "./sendPages.generated";

const createPageNodeMutation = gql`
    mutation CreatePageNode($input: PageTreeNodeCreateInput!, $contentScope: PageTreeNodeScopeInput!, $category: String!) {
        createPageTreeNode(input: $input, scope: $contentScope, category: $category) {
            id
        }
    }
`;

export interface SendPagesOptions {
    /**
     * The position where the new page(s) should be pasted.
     * If undefined, the page(s) are added at the very end
     * */
    targetPos?: number;

    updateProgress?: (progress: number, message: ReactNode) => void;
}

interface SendPagesDependencies {
    client: ApolloClient<unknown>;
    scope: ContentScope;
    documentTypes: PageTreeConfig["documentTypes"];
    apiUrl: string;
    damScope: Record<string, unknown>;
    currentCategory: string;
    damBasePath: string;
}

/**
 * Iterates over passed pages synchronous and creates data with mutations
 *
 * Process:
 *      1. copy all files used on the pages to the target DAM scope
 *      2. traverses the tree with top-down strategy and create page tree nodes
 *          2a. Generate unique slug by adding "{slug}-{uniqueNumber}" to the slug
 *          2b. Create new PageTreeNode with new name "{name} {uniqueNumber}" and new parent
 *      3. create documents and attach them to the page tree nodes
 *          3a. Replace unhandled dependencies with undefined (when copying to another scope)
 *          3b. Create new document and attach it to new page tree node
 *      4. Refetch Pages query
 *
 **/
export async function sendPages(
    parentId: string | null,
    { pages, scope: sourceContentScope }: PagesClipboard,
    options: SendPagesOptions,
    { client, scope: targetContentScope, documentTypes, apiUrl, damScope: targetDamScope, currentCategory, damBasePath }: SendPagesDependencies,
    updateProgress: (progress: number, message: ReactNode) => void,
): Promise<void> {
    const dependencyReplacements = createPageTreeNodeIdReplacements(pages);
    const hasDamScope = Object.entries(targetDamScope).length > 0;

    // 1. copy all files used on the pages to the target DAM scope
    updateProgress(0, <FormattedMessage id="dextinity.pages.paste.analyzingPages" defaultMessage="analyzing pages" />);
    {
        //TODO use the file's size to build a progress bar for uploading/downloading files
        const filesToCopy: DamFileToCopy[] = [];
        for (const sourcePage of pages) {
            const documentType = documentTypes[sourcePage.documentType];
            if (!documentType) {
                throw new Error(`Unknown document type "${documentType}"`);
            }
            if (sourcePage?.document != null) {
                filesToCopy.push(...damFilesFromDependencies(documentType.dependencies(sourcePage.document)));
            }
        }

        dependencyReplacements.push(
            ...(await copyDamFilesToScope({
                client,
                files: filesToCopy,
                targetDamScope,
                updateProgress: (progress) =>
                    updateProgress(
                        progress * 10, // 10% of progress is used for copying the files
                        <FormattedMessage id="dextinity.pages.paste.copyingAssets" defaultMessage="copying assets" />,
                    ),
            })),
        );
    }

    // 2. traverses the tree with top-down strategy and create page tree nodes
    updateProgress(10, <FormattedMessage id="dextinity.pages.paste.creatingPages" defaultMessage="creating pages" />);

    const handlePageTreeNode = async (node: PageClipboard, newParentId: string | null, posOffset: number): Promise<string> => {
        const documentType = documentTypes[node.documentType];
        if (!documentType) {
            throw new Error(`Unknown document type "${documentType}"`);
        }

        // 2a. Generate unique slug by adding "{slug}-{uniqueNumber}" to the slug
        const { slug, name } = await findAvailableSlug(client, {
            slug: node.slug,
            name: node.name,
            parentId: newParentId,
            scope: targetContentScope,
        });

        // 2b. Create new PageTreeNode with new name "{name} {uniqueNumber}" and new parent
        const { data } = await client.mutate<GQLCreatePageNodeMutation, GQLCreatePageNodeMutationVariables>({
            mutation: createPageNodeMutation,
            variables: {
                input: {
                    id: dependencyReplacements.find((replacement) => replacement.type == "PageTreeNode" && replacement.originalId === node.id)
                        ?.replaceWithId,
                    name,
                    slug,
                    hideInMenu: node.hideInMenu,
                    attachedDocument: {
                        type: node.documentType,
                    },
                    parentId: newParentId,
                    pos: options.targetPos ? options.targetPos + posOffset : undefined,
                },
                contentScope: targetContentScope,
                category: currentCategory,
            },
            context: LocalErrorScopeApolloContext,
        });
        if (!data?.createPageTreeNode.id) {
            throw Error("Did not receive new uuid for page tree node");
        }

        return data.createPageTreeNode.id;
    };
    {
        const tree = arrayToTreeMap<PageClipboard>(pages);
        let progressPages = 0;
        const traverse = async (parentId: string, newParentId: string | null): Promise<void> => {
            const nodes = tree.get(parentId) || [];
            let posOffset = 0;
            for (const node of nodes) {
                const newPageTreeUUID = await handlePageTreeNode(node, newParentId, posOffset++);

                progressPages++;
                updateProgress(
                    10 + (progressPages / pages.length) * 40,
                    <FormattedMessage id="dextinity.pages.paste.creatingPages" defaultMessage="creating pages" />,
                ); // next 40% of progress is used for creating pages
                await traverse(node.id, newPageTreeUUID);
            }
        };
        await traverse("root", parentId);
    }

    // 3. create documents and attach them to the page tree nodes
    // no top-down strategy needed
    {
        updateProgress(50, <FormattedMessage id="dextinity.pages.paste.creatingDocuments" defaultMessage="creating documents" />);
        let progressPages = 0;
        for (const sourcePage of pages) {
            const documentType = documentTypes[sourcePage.documentType];
            if (!documentType) {
                throw new Error(`Unknown document type "${documentType}"`);
            }
            const newPageTreeNodeId = dependencyReplacements.find(
                (replacement) => replacement.type == "PageTreeNode" && replacement.originalId === sourcePage.id,
            )?.replaceWithId;
            if (!newPageTreeNodeId) {
                throw new Error(`Could not find new page tree node id`);
            }

            // 3a. Replace unhandled dependencies with undefined (when copying to another scope)
            if (sourcePage.document && !isEqual(sourceContentScope, targetContentScope)) {
                const unhandledDependencies = unhandledDependenciesFromDocument(documentType, sourcePage.document, {
                    existingReplacements: dependencyReplacements,
                    hasDamScope,
                    targetDamScope,
                });

                const replacementsForUnhandledDependencies = createUndefinedReplacementsForDependencies(unhandledDependencies);
                dependencyReplacements.push(...replacementsForUnhandledDependencies);
            }

            // 3b. Create new document and attach it to new page tree node
            const newDocumentId = uuid();
            if (
                sourcePage?.document != null &&
                documentType.updateMutation &&
                documentType.inputToOutput &&
                documentType.replaceDependenciesInOutput
            ) {
                await client.mutate<unknown, GQLUpdatePageMutationVariables>({
                    mutation: documentType.updateMutation,
                    variables: {
                        pageId: newDocumentId,
                        input: documentType.replaceDependenciesInOutput(documentType.inputToOutput(sourcePage.document), dependencyReplacements),
                        attachedPageTreeNodeId: newPageTreeNodeId,
                    },
                    context: LocalErrorScopeApolloContext,
                });
            }
            progressPages++;
            updateProgress(
                50 + (progressPages / pages.length) * 50,
                <FormattedMessage id="dextinity.pages.paste.creatingDocuments" defaultMessage="creating documents" />,
            ); // last 50% of progress is used for creating documents
        }
    }

    updateProgress(100, <FormattedMessage id="dextinity.pages.paste.reloadingPages" defaultMessage="reloading pages" />);

    // 4. Refetch Pages query
    await client.refetchQueries({ include: ["Pages"] });
}

/**
 * Creates a mapping between the old page tree node ID and a new page tree ID. Used for rewriting links to internal pages.
 * @param nodes
 */
function createPageTreeNodeIdReplacements(nodes: PageClipboard[]): ReplaceDependencyObject[] {
    const replacements: ReplaceDependencyObject[] = [];

    for (const node of nodes) {
        replacements.push({ type: "PageTreeNode", originalId: node.id, replaceWithId: uuid() });
    }

    return replacements;
}

function unhandledDependenciesFromDocument(
    documentType: DocumentInterface,
    document: GQLDocument,
    {
        existingReplacements,
        hasDamScope = false,
        targetDamScope,
    }: { existingReplacements: ReplaceDependencyObject[]; hasDamScope?: boolean; targetDamScope: Record<string, unknown> },
) {
    const unhandledDependencies = documentType.dependencies(document).filter((dependency) => {
        if (isDamFileDependency(dependency)) {
            if (!hasDamScope) {
                // If there is no DAM scoping (DAM = global), the dependency is not unhandled. It's handled correctly by doing nothing
                return false;
            }

            if (isEqual(dependency.data.damFile.scope, targetDamScope)) {
                // Source and target DAM scope are the same, so no need to handle this dependency
                return false;
            }
        }

        return !existingReplacements.some(
            (replacement) => replacement.originalId === dependency.id && replacement.type === dependency.targetGraphqlObjectType,
        );
    });

    return unhandledDependencies;
}
