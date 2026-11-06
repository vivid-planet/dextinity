import { type ApolloError, gql, type TypedDocumentNode, useApolloClient, useQuery } from "@apollo/client";
import { messages } from "@dextinity/admin";
import { Button, Icon, type SaveStateValue, Tooltip } from "@dextinity/ui";
import { deepEqual } from "fast-equals";
import { createElement, type Dispatch, type JSX, type ReactNode, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import type { BlockInterface, BlockState } from "../blocks/types";
import { resolveNewState } from "../blocks/utils";
import { parallelAsyncEvery } from "../blocks/utils/parallelAsyncEvery";
import type { GQLDocumentInterface } from "../graphql.generated";
import type { GQLCheckForChangesQuery, GQLCheckForChangesQueryVariables } from "./createUsePage.generated";
import { LocalPageTreeNodeDocumentAnchorsProvider } from "./LocalPageTreeNodeDocumentAnchors";
import { resolveHasSaveConflict } from "./resolveHasSaveConflict";
import { useSaveConflictQuery } from "./useSaveConflictQuery";

type Output = Record<string, unknown>;
// dictionary of all root-blocks connected to a page
type RootBlocksInterface = Record<string, BlockInterface>;

// Template for the GQL-Query, it must at minimum look like this
interface GQLEditPageQueryInterface<PageType extends string> {
    page: {
        // path: string;
        document:
            | (GQLDocumentInterface & {
                  __typename: PageType | string;
                  [key: string]: unknown;
              })
            | null;
    } | null;
}

// root-blocks connected to a page, in the GQL
type BlockGQLData<T extends RootBlocksInterface> = {
    [K in keyof T]: unknown;
};

// all static configuration options needed to create a usePage hook

interface CreateUsePage {
    <RootBlocks extends RootBlocksInterface, PageType extends string>(outerOptions: {
        rootBlocks: RootBlocks;
        pageType: PageType;
    }): <
        GQLEditPageQuery extends GQLEditPageQueryInterface<PageType> | null, // the page state is infered from this
        GQLEditPageQueryVariables extends { id: string } = { id: string }, // for type-safety, query must match this shape
        GQLUpdatePageMutation extends { id: string } & BlockGQLData<RootBlocks> = {
            id: string;
        } & BlockGQLData<RootBlocks>, // for type-safety, mutation must match this shape
        GQLUpdatePageMutationVariables extends {
            pageId: string;
            input: BlockGQLData<RootBlocks>;
            lastUpdatedAt?: string | null;
            attachedPageTreeNodeId?: string | null;
        } = {
            pageId: string;
            input: BlockGQLData<RootBlocks>;
            lastUpdatedAt?: string | null;
            attachedPageTreeNodeId?: string | null;
        }, // for type-safety, api must support those variables
    >(options: {
        getQuery: TypedDocumentNode<GQLEditPageQuery, GQLEditPageQueryVariables>;
        updateMutation: TypedDocumentNode<GQLUpdatePageMutation, GQLUpdatePageMutationVariables>;
    }) => UsePageFn<GQLEditPageQuery, RootBlocks, PageType>;
}

// used to build the page state:
// exchanges the untyped GQL block-types with the block-state from the block-interfaces
type ReplaceBlockInputDataWithBlockState<Doc extends Record<string, unknown> | null, RootBlocks extends RootBlocksInterface> =
    | null
    | {
          [K in keyof Doc]: K extends "id" ? string : K extends keyof RootBlocks ? BlockState<RootBlocks[K]> : Doc[K]; // key id is always a string and never a block
      };

export type PageState<
    GQLEditPageQuery extends GQLEditPageQueryInterface<PageType> | null,
    RootBlocks extends RootBlocksInterface,
    PageType extends string,
> = NonNullable<{
    [K in keyof NonNullable<NonNullable<GQLEditPageQuery>["page"]>]: K extends "document"
        ? ReplaceBlockInputDataWithBlockState<
              Extract<NonNullable<NonNullable<GQLEditPageQuery>["page"]>["document"], { __typename: PageType }>,
              RootBlocks
          >
        : NonNullable<NonNullable<GQLEditPageQuery>["page"]>[K];
}>;

// hook exposes a block-api
type BlockNodeApi<RootBlocks extends RootBlocksInterface> = {
    [K in keyof RootBlocks]: {
        adminUI: ReactNode;
        isValid: () => Promise<boolean>;
    };
};
interface UsePageProps {
    pageId: string;
    onValidationFailed?: () => void;
}
interface UsePageApi<PageState, RootBlocks extends RootBlocksInterface> {
    pageState?: PageState;
    /**
     * Updates the page state, for instance, to programmatically change the content of a root block.
     *
     * The changes are only applied locally, call `handleSavePage` to persist them.
     */
    setPageState: Dispatch<SetStateAction<PageState | undefined>>;
    rootBlocksApi: BlockNodeApi<RootBlocks>;
    /** Saves the page. Resolves `false` when the page wasn't saved, e.g. because it is invalid, has a save conflict, or saving failed. */
    handleSavePage: () => Promise<boolean>;
    hasChanges?: boolean;
    loading: boolean;
    error: ApolloError | undefined;
    saving: boolean;
    saveError: "invalid" | "conflict" | "error" | undefined;
    /** The page's save state for `SaveState` of `@dextinity/ui`. */
    saveState: SaveStateValue;
    /** When the loaded version of the document was saved, for `SaveState`'s `savedAt`. */
    savedAt?: Date;
    /**
     * Whether each root block is valid, e.g. to mark the tab of an invalid root block. `undefined` until the validation of the current
     * state has finished.
     */
    rootBlocksValidity: Partial<Record<keyof RootBlocks, boolean>>;
    /**
     * @deprecated Build the save action from `handleSavePage`, `hasChanges` and `saving`, e.g. with `Button` and `SaveState` of
     * `@dextinity/ui`.
     */
    pageSaveButton: JSX.Element;
    dialogs: ReactNode;
    resetPageStateToLatest: () => Promise<void>;
    translateContent: (batchTranslate: (texts: string[]) => Promise<string[]>) => Promise<void>;
}

// signature of the usePage hook
type UsePageFn<
    GQLEditPageQuery extends GQLEditPageQueryInterface<PageType> | null,
    RootBlocks extends RootBlocksInterface,
    PageType extends string,
> = (p: UsePageProps) => UsePageApi<PageState<GQLEditPageQuery, RootBlocks, PageType>, RootBlocks>;

export const createUsePage: CreateUsePage =
    <RootBlocks extends RootBlocksInterface, PageType extends string>({
        rootBlocks,
        pageType: gqlPageType,
    }: {
        rootBlocks: RootBlocks;
        pageType: PageType;
    }) =>
    <
        GQLEditPageQuery extends GQLEditPageQueryInterface<PageType> | null,
        GQLEditPageQueryVariables extends { id: string },
        GQLUpdatePageMutation extends {
            id: string;
        } & BlockGQLData<RootBlocks>,
        GQLUpdatePageMutationVariables extends {
            pageId: string;
            input: BlockGQLData<RootBlocks>;
            lastUpdatedAt?: string | null;
            attachedPageTreeNodeId?: string | null;
        },
    >({
        getQuery,
        updateMutation,
    }: {
        getQuery: TypedDocumentNode<GQLEditPageQuery, GQLEditPageQueryVariables>;
        updateMutation: TypedDocumentNode<GQLUpdatePageMutation, GQLUpdatePageMutationVariables>;
    }) => {
        // internal PageState alias
        type PS = PageState<GQLEditPageQuery, RootBlocks, PageType>;
        function createEmptyPageDocument(): PS["document"] {
            return {
                id: uuid(),
                __typename: gqlPageType,
                ...Object.entries(rootBlocks).reduce(
                    (a, [key, value]) => ({
                        ...a,
                        [key]: value.defaultValues(),
                    }),
                    {},
                ),
            } as PS["document"];
        }

        return function usePage({
            pageId,
            onValidationFailed,
        }: UsePageProps): UsePageApi<PageState<GQLEditPageQuery, RootBlocks, PageType>, RootBlocks> {
            const client = useApolloClient();
            const [pageState, setPageState] = useState<undefined | PS>(undefined);
            const [referenceOutput, setReferenceOutput] = useState<undefined | Output>(undefined);
            const [saving, setSaving] = useState(false);
            const [saveError, setSaveError] = useState<"invalid" | "conflict" | "error" | undefined>();

            const generateOutput = (ps: PS): Output => {
                return {
                    ...Object.entries(rootBlocks).reduce(
                        (a, [key, value]) => ({
                            ...a,
                            [key]: value.state2Output(ps.document?.[key]),
                        }),
                        {},
                    ),
                };
            };

            let hasChanges: boolean | undefined = undefined;

            try {
                if (pageState) {
                    hasChanges = !deepEqual(referenceOutput, generateOutput(pageState));
                }
            } catch {
                // Can't generate the output. This is likely to be caused by adding new blocks which have an invalid output upon creation (for instance
                // the image block, as it requires a file to be selected). We assume that the user made some changes to the page content.
                hasChanges = true;
            }

            const { loading, data, error, refetch } = useQuery<GQLEditPageQuery, GQLEditPageQueryVariables>(getQuery, {
                variables: {
                    id: pageId,
                } as GQLEditPageQueryVariables,
            });

            const resetPageStateToLatest = async () => {
                //resets the page state by refetch data from server
                await refetch();
            };

            const {
                dialogs,
                checkForConflicts: checkForSaveConflict,
                hasConflict,
            } = useSaveConflictQuery<GQLCheckForChangesQuery, GQLCheckForChangesQueryVariables>(
                checkForChangesQuery,
                {
                    variables: {
                        id: pageId,
                    },
                    resolveHasConflict: (data) => {
                        return resolveHasSaveConflict(pageState?.document?.updatedAt, data?.page?.document?.updatedAt);
                    },
                    skip: saving,
                },
                {
                    hasChanges: hasChanges ?? false,
                    loadLatestVersion: async () => {
                        await resetPageStateToLatest();
                    },
                    onDiscardButtonPressed: async () => {
                        await resetPageStateToLatest();
                    },
                },
            );

            // manage sync of page state and gql-api
            useEffect(() => {
                if (data?.page) {
                    const page = {
                        ...data.page,
                        document:
                            data.page.document && data.page.document.__typename === gqlPageType
                                ? {
                                      ...data.page.document,

                                      ...Object.entries(rootBlocks).reduce(
                                          (a, [key, value]) => ({
                                              ...a,
                                              [key]: value.input2State(data.page?.document?.[key]),
                                          }),
                                          {},
                                      ),
                                  }
                                : createEmptyPageDocument(),
                    } as unknown as PS;
                    setPageState(page);
                    setReferenceOutput(generateOutput(page));
                }
            }, [data, pageId]);

            const handleSavePage = useCallback(async () => {
                // TODO show progress and error handling
                if (pageState && pageState.document && pageState.document.__typename === gqlPageType && pageState.document.id) {
                    setSaving(true);
                    setSaveError(undefined);

                    const isValid = await parallelAsyncEvery(Object.entries(rootBlocks), async ([key, block]) => {
                        return block.isValid(pageState.document?.[key]);
                    });

                    if (!isValid) {
                        onValidationFailed?.();
                        setSaving(false);
                        setSaveError("invalid");
                        return false;
                    }

                    const hasSaveConflict = await checkForSaveConflict();
                    if (hasSaveConflict) {
                        setSaving(false);
                        setSaveError("conflict");
                        return false; // dialogs open for the user to handle the conflict
                    }

                    try {
                        await client.mutate<GQLUpdatePageMutation, GQLUpdatePageMutationVariables>({
                            mutation: updateMutation,
                            variables: {
                                pageId: pageState.document.id,
                                lastUpdatedAt: data?.page?.document?.updatedAt,
                                input: {
                                    ...Object.entries(rootBlocks).reduce(
                                        (a, [key, value]) => ({
                                            ...a,
                                            [key]: value.state2Output(pageState.document?.[key]),
                                        }),
                                        {},
                                    ),
                                    // stage: pageState.document.stage ? StageBlock.state2Output(pageState.document.stage) : null, refactor stage to optional block
                                },
                                attachedPageTreeNodeId: pageId,
                            } as GQLUpdatePageMutationVariables,
                            refetchQueries: [getQuery],
                            awaitRefetchQueries: true,
                            update(cache) {
                                // update reference to pageTreeNode
                                // needed for newly created pageTreeNodes
                                cache.writeFragment({
                                    id: cache.identify({ __typename: "PageTreeNode", id: pageId }),
                                    fragment: gql`
                                        fragment UpdateReferencePageTree on PageTreeNode {
                                            document {
                                                ... on DocumentInterface {
                                                    id
                                                }
                                            }
                                        }
                                    `,
                                    data: {
                                        document: {}, // reference to document is somehow magically updated without providing a value
                                    },
                                });
                            },
                        });
                    } catch (error) {
                        console.error(error);
                        setSaveError("error");
                        setSaving(false);
                        return false;
                    }

                    setReferenceOutput(generateOutput(pageState));
                    setSaving(false);
                    return true;
                } else if (pageState && pageState.document) {
                    throw new Error(`saving this type of document (type == ${pageState.document.__typename}) is currently not implemented`);
                } else {
                    throw new Error("No page state");
                }
            }, [data, client, pageId, pageState, onValidationFailed, checkForSaveConflict]);

            // allow to create an updateHandler for each block-node
            const createHandleUpdate = useCallback((key: string) => {
                const handleUpdateState: Dispatch<SetStateAction<BlockInterface>> = (setStateAction) => {
                    setPageState((s) => {
                        if (!s || !s.document) {
                            return;
                        }
                        const relevantOldState: BlockState<BlockInterface> = s.document[key] as BlockState<BlockInterface>;
                        const newBlockState = resolveNewState({ prevState: relevantOldState, setStateAction });

                        const newState: PS = {
                            ...s,
                            document: {
                                ...s?.document,
                                [key]: newBlockState,
                            },
                        };

                        return newState;
                    });
                };
                return handleUpdateState;
            }, []);

            // create block-api
            // - bind state, updatehandler to admin-component
            const rootBlocksApi: BlockNodeApi<RootBlocks> = useMemo(() => {
                const localAnchors =
                    pageState?.document === undefined
                        ? {}
                        : {
                              [pageId]: Array.from(
                                  new Set(
                                      Object.entries(rootBlocks).reduce(
                                          (anchors, [key, block]) => [...anchors, ...(block.anchors?.(pageState?.document?.[key]) ?? [])],
                                          [] as string[],
                                      ),
                                  ),
                              ),
                          };
                return Object.entries(rootBlocks).reduce((a, [key, value]) => {
                    const UnboundComponent = value.AdminComponent;
                    const state = pageState && pageState.document ? pageState.document[key] : null;
                    const handleUpdateState = createHandleUpdate(key);

                    return {
                        ...a,
                        [key]: {
                            adminUI: state ? (
                                <LocalPageTreeNodeDocumentAnchorsProvider localAnchors={localAnchors}>
                                    {createElement(UnboundComponent, { state, updateState: handleUpdateState })}
                                </LocalPageTreeNodeDocumentAnchorsProvider>
                            ) : null,
                            isValid: async () => value.isValid(state),
                        },
                    };
                }, {} as BlockNodeApi<RootBlocks>);
            }, [pageState, createHandleUpdate, pageId]);

            const pageSaveButton = useMemo<JSX.Element>(
                () => (
                    <PageSaveButton
                        hasConflict={hasConflict}
                        hasChanges={hasChanges}
                        handleSavePage={handleSavePage}
                        saveError={saveError}
                        saving={saving}
                    />
                ),
                [hasConflict, hasChanges, handleSavePage, saveError, saving],
            );

            const translateContent = useCallback(
                async (batchTranslate: (texts: string[]) => Promise<string[]>) => {
                    if (!pageState?.document) {
                        return;
                    }

                    // Pass 1: Collect all translatable texts
                    const collectedTexts: string[] = [];
                    const collectingTranslate = async (text: string): Promise<string> => {
                        collectedTexts.push(text);
                        return text;
                    };

                    await Promise.all(
                        Object.entries(rootBlocks).map(async ([key, block]) => {
                            if (block.translateContent) {
                                await block.translateContent(pageState.document?.[key], collectingTranslate);
                            }
                        }),
                    );

                    if (collectedTexts.length === 0) {
                        return;
                    }

                    // Pass 2: Batch translate
                    const translatedTexts = await batchTranslate(collectedTexts);

                    // Pass 3: Apply translations
                    let textIndex = 0;
                    const applyingTranslate = async (_text: string): Promise<string> => {
                        return translatedTexts[textIndex++];
                    };

                    const translatedRootBlocks = await Promise.all(
                        Object.entries(rootBlocks).map(async ([key, block]) => {
                            const state = pageState.document?.[key];
                            const translatedState = block.translateContent ? await block.translateContent(state, applyingTranslate) : state;
                            return [key, translatedState];
                        }),
                    );

                    setPageState((s) => {
                        if (!s?.document) {
                            return s;
                        }
                        return {
                            ...s,
                            document: {
                                ...s.document,
                                ...Object.fromEntries(translatedRootBlocks),
                            },
                        } as PS;
                    });
                },
                [pageState],
            );

            const [rootBlocksValidity, setRootBlocksValidity] = useState<Partial<Record<keyof RootBlocks, boolean>>>({});
            useEffect(() => {
                const document = pageState?.document;
                if (document == null) {
                    return;
                }
                let isCurrent = true;
                const validateRootBlocks = async () => {
                    const entries = await Promise.all(
                        Object.entries(rootBlocks).map(async ([key, block]) => [key, await block.isValid(document[key])] as const),
                    );
                    if (isCurrent) {
                        setRootBlocksValidity(Object.fromEntries(entries) as Partial<Record<keyof RootBlocks, boolean>>);
                    }
                };
                validateRootBlocks();
                return () => {
                    isCurrent = false;
                };
            }, [pageState?.document]);

            const saveState: SaveStateValue = saving ? "saving" : saveError != null || hasConflict ? "error" : hasChanges ? "dirty" : "saved";
            const loadedUpdatedAt = data?.page?.document?.updatedAt;
            const savedAt = useMemo(() => (loadedUpdatedAt != null ? new Date(loadedUpdatedAt) : undefined), [loadedUpdatedAt]);

            return {
                hasChanges,
                handleSavePage,
                saveState,
                savedAt,
                rootBlocksValidity,
                pageState,
                setPageState,
                rootBlocksApi,
                loading,
                error,
                saveError,
                saving,
                pageSaveButton,
                resetPageStateToLatest,
                translateContent,
                dialogs,
            };
        };
    };

const checkForChangesQuery = gql`
    query CheckForChanges($id: ID!) {
        page: pageTreeNode(id: $id) {
            document {
                ... on DocumentInterface {
                    updatedAt
                }
            }
        }
    }
`;

interface PageSaveButtonProps {
    handleSavePage: () => Promise<unknown>;
    hasChanges?: boolean;
    hasConflict: boolean;
    saving: boolean;
    saveError: "invalid" | "conflict" | "error" | undefined;
}

function PageSaveButton({ handleSavePage, hasChanges, hasConflict, saving, saveError }: PageSaveButtonProps): JSX.Element {
    const intl = useIntl();
    const hasErrors = saveError != null || hasConflict;
    const errorMessage =
        saveError === "invalid"
            ? intl.formatMessage(messages.invalidData)
            : saveError === "conflict" || hasConflict
              ? intl.formatMessage(messages.saveConflict)
              : saveError === "error"
                ? intl.formatMessage(messages.error)
                : undefined;

    const button = (
        <Button
            color={hasErrors ? "error" : "primary"}
            startIcon={<Icon name={hasErrors ? "error" : "check"} />}
            disabled={!hasChanges}
            loading={saving}
            onClick={handleSavePage}
        >
            <FormattedMessage {...messages.save} />
        </Button>
    );

    return errorMessage != null ? <Tooltip content={errorMessage}>{button}</Tooltip> : button;
}
