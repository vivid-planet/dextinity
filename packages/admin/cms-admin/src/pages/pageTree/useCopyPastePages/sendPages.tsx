import { type ApolloClient, gql } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import isEqual from "lodash.isequal";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { v4 as uuid } from "uuid";

import type { BlockDependency, ReplaceDependencyObject } from "../../../blocks/types";
import type { ContentScope } from "../../../contentScope/Provider";
import type { DocumentInterface, GQLDocument, GQLUpdatePageMutationVariables } from "../../../documents/types";
import type { GQLDamFile } from "../../../graphql.generated";
import type { PageTreeConfig } from "../../pageTreeConfig";
import { findAvailableSlug } from "../findAvailableSlug";
import { arrayToTreeMap } from "../treemap/TreeMapUtils";
import type { PageClipboard, PagesClipboard } from "../useCopyPastePages";
import { createInboxFolder } from "./createInboxFolder";
import type {
    GQLCopyFilesToScopeMutation,
    GQLCopyFilesToScopeMutationVariables,
    GQLCreatePageNodeMutation,
    GQLCreatePageNodeMutationVariables,
    GQLFindCopiesOfFileInScopeQuery,
    GQLFindCopiesOfFileInScopeQueryVariables,
} from "./sendPages.generated";

const createPageNodeMutation = gql`
    mutation CreatePageNode($input: PageTreeNodeCreateInput!, $contentScope: PageTreeNodeScopeInput!, $category: String!) {
        createPageTreeNode(input: $input, scope: $contentScope, category: $category) {
            id
        }
    }
`;

const copyFilesToScopeMutation = gql`
    mutation CopyFilesToScope($fileIds: [ID!]!, $inboxFolderId: ID!) {
        copyFilesToScope(fileIds: $fileIds, inboxFolderId: $inboxFolderId) {
            mappedFiles {
                rootFile {
                    id
                }
                copy {
                    id
                }
            }
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
 *      1. find all source scopes of file dependencies, to create an dam inbox folder if needed
 *      2. traverses the tree with top-down strategy and create page tree nodes
 *          2a. Generate unique slug by adding "{slug}-{uniqueNumber}" to the slug
 *          2b. Create new PageTreeNode with new name "{name} {uniqueNumber}" and new parent
 *      3. create documents (and copy files if required) and attach them to the page tree nodes
 *          3a. Copy all files used on page to target scope
 *          3b.  Replace unhandled dependencies with undefined (when copying to another scope)
 *          3c. Create new document and attach it to new page tree node
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
    let inboxFolderIdForCopiedFiles: string | undefined = undefined;
    const hasDamScope = Object.entries(targetDamScope).length > 0;

    // 1. find all source scopes of file dependencies, to create an dam inbox folder if needed
    updateProgress(0, <FormattedMessage id="dextinity.pages.paste.analyzingPages" defaultMessage="analyzing pages" />);
    {
        let progressPages = 0;
        const sourceScopes: Record<string, unknown>[] = [];
        for (const sourcePage of pages) {
            const documentType = documentTypes[sourcePage.documentType];
            if (!documentType) {
                throw new Error(`Unknown document type "${documentType}"`);
            }
            if (sourcePage?.document != null) {
                for (const damFile of fileDependenciesFromDocument(documentType, sourcePage.document)) {
                    //TODO use damFile.size; to build a progress bar for uploading/downloading files
                    if (dependencyReplacements.some((replacement) => replacement.type == "DamFile" && replacement.originalId === damFile.id)) {
                        //file already handled (same file used multiple times on page)
                    } else if (!hasDamScope || isEqual(damFile.scope, targetDamScope)) {
                        //same scope, same server, no need to copy
                    } else {
                        // TODO eventually handle multiple files in one request for better performance
                        const { data } = await client.query<GQLFindCopiesOfFileInScopeQuery, GQLFindCopiesOfFileInScopeQueryVariables>({
                            query: gql`
                                query FindCopiesOfFileInScope($id: ID!, $scope: DamScopeInput!, $imageCropArea: ImageCropAreaInput) {
                                    findCopiesOfFileInScope(id: $id, scope: $scope, imageCropArea: $imageCropArea) {
                                        id
                                    }
                                }
                            `,
                            variables: {
                                id: damFile.id,
                                scope: targetDamScope,
                                imageCropArea: damFile.image?.cropArea,
                            },
                        });
                        if (data.findCopiesOfFileInScope.length > 0) {
                            // use already existing file
                            dependencyReplacements.push({
                                type: "DamFile",
                                originalId: damFile.id,
                                replaceWithId: data.findCopiesOfFileInScope[0].id,
                            });
                        } else {
                            // copying is required
                            if (damFile.scope && !sourceScopes.some((scope) => isEqual(scope, damFile.scope))) {
                                sourceScopes.push(damFile.scope);
                            }
                        }
                    }
                }
            }
            progressPages++;
            updateProgress(
                (progressPages / pages.length) * 10,
                <FormattedMessage id="dextinity.pages.paste.analyzingPages" defaultMessage="analyzing pages" />,
            ); // 10% of progress is used for analyzing pages
        }

        if (sourceScopes.length > 0) {
            const { id } = await createInboxFolder({
                client,
                targetScope: targetDamScope,
                sourceScopes,
            });
            inboxFolderIdForCopiedFiles = id;
        }
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

    // 3. create documents (and copy files if required) and attach them to the page tree nodes
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

            // 3a. Copy all files used on page to target scope
            const fileIdsToCopyDirectly: string[] = [];
            if (sourcePage?.document != null) {
                for (const damFile of fileDependenciesFromDocument(documentType, sourcePage.document)) {
                    if (dependencyReplacements.some((replacement) => replacement.type == "DamFile" && replacement.originalId === damFile.id)) {
                        //already copied
                    } else {
                        // not copied yet
                        if (!hasDamScope || isEqual(damFile.scope, targetDamScope)) {
                            //same scope, same server, no need to copy
                        } else {
                            //batch copy below
                            fileIdsToCopyDirectly.push(damFile.id);
                        }
                    }
                }

                if (fileIdsToCopyDirectly.length > 0) {
                    if (!inboxFolderIdForCopiedFiles) {
                        throw new Error("inbox folder must be created in step 0 when files need to be copied");
                    }
                    const { data: copiedFiles } = await client.mutate<GQLCopyFilesToScopeMutation, GQLCopyFilesToScopeMutationVariables>({
                        mutation: copyFilesToScopeMutation,
                        variables: { fileIds: fileIdsToCopyDirectly, inboxFolderId: inboxFolderIdForCopiedFiles },
                        update: (cache, result) => {
                            cache.evict({ fieldName: "damItemsList" });
                        },
                    });

                    if (copiedFiles) {
                        for (const item of copiedFiles.copyFilesToScope.mappedFiles) {
                            dependencyReplacements.push({ type: "DamFile", originalId: item.rootFile.id, replaceWithId: item.copy.id });
                        }
                    }
                }
            }

            // 3b. Replace unhandled dependencies with undefined (when copying to another scope)
            if (sourcePage.document && !isEqual(sourceContentScope, targetContentScope)) {
                const unhandledDependencies = unhandledDependenciesFromDocument(documentType, sourcePage.document, {
                    existingReplacements: dependencyReplacements,
                    hasDamScope,
                    targetDamScope,
                });

                const replacementsForUnhandledDependencies = createUndefinedReplacementsForDependencies(unhandledDependencies);
                dependencyReplacements.push(...replacementsForUnhandledDependencies);
            }

            // 3c. Create new document and attach it to new page tree node
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

function createUndefinedReplacementsForDependencies(dependencies: BlockDependency[]) {
    const existingReplacements = new Set();
    const replacements: ReplaceDependencyObject[] = [];

    for (const dependency of dependencies) {
        const key = `${dependency.targetGraphqlObjectType}#${dependency.id}`;

        if (!existingReplacements.has(key)) {
            replacements.push({ type: dependency.targetGraphqlObjectType, originalId: dependency.id, replaceWithId: undefined });
            existingReplacements.add(key);
        }
    }

    return replacements;
}

function fileDependenciesFromDocument(documentType: DocumentInterface, document: GQLDocument) {
    return documentType
        .dependencies(document)
        .filter(isDamFileDependency)
        .map((dependency) => {
            return dependency.data.damFile;
        });
}

function isDamFileDependency(
    dependency: BlockDependency,
): dependency is BlockDependency & { data: { damFile: GQLDamFile & { scope?: Record<string, unknown> } } } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dependency.targetGraphqlObjectType === "DamFile" && dependency.data && (dependency.data as any).damFile;
}
