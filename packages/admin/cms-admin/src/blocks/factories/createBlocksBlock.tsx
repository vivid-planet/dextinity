import { StackPage, StackPageTitle, StackSwitch, StackSwitchApiContext } from "@dextinity/admin";
import { type Dispatch, type FunctionComponent, type ReactNode, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { useContentScope } from "../../contentScope/Provider";
import { CannotPasteBlockDialog } from "../clipboard/CannotPasteBlockDialog";
import { useBlockClipboard } from "../clipboard/useBlockClipboard";
import { AddBlockDrawer } from "../common/AddBlockDrawer";
import { BlockRow, type BlockRowMenuApi } from "../common/blockRow/BlockRow";
import { BlockRowList } from "../common/blockRow/BlockRowList";
import { useBlockListToasts } from "../common/blockRow/useBlockListToasts";
import { useBlocksConfig } from "../config/BlocksConfigContext";
import { useBlockContext } from "../context/useBlockContext";
import { messageText } from "../form/messageText";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { deduplicateBlockDependencies } from "../helpers/deduplicateBlockDependencies";
import { SelectPreviewComponent } from "../iframebridge/SelectPreviewComponent";
import type { BlockDependency, BlockInterface, BlockState, PreviewContent } from "../types";
import { resolveNewState } from "../utils";
import { parallelAsyncEvery } from "../utils/parallelAsyncEvery";

// Using {} instead of Record<string, never> because never and unknown are incompatible.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type DefaultAdditionalItemFields = {};

type BlocksBlockItem<
    T extends BlockInterface = BlockInterface,
    AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields,
> = {
    [key: string]: unknown;
    key: string;
    type: string;
    visible: boolean;
    selected: boolean;
    props: BlockState<T>;
    slideIn: boolean;
} & AdditionalItemFields;

type RemovedBlocksBlockItem<
    T extends BlockInterface = BlockInterface,
    AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields,
> = BlocksBlockItem<T, AdditionalItemFields> & { removedAt: number };

export interface BlocksBlockState<AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields> {
    blocks: BlocksBlockItem<BlockInterface, AdditionalItemFields>[];
}

export interface BlocksBlockFragment<AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields> {
    blocks: Array<
        {
            [key: string]: unknown;
            key: string;
            type: string;
            visible: boolean;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            props: any;
        } & AdditionalItemFields
    >;
}

export interface BlocksBlockOutput<AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields> {
    blocks: Array<
        {
            [key: string]: unknown;
            key: string;
            type: string;
            visible: boolean;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            props: any;
        } & AdditionalItemFields
    >;
}

type BlockType = string;

interface BlocksBlockAdditionalItemField<Value = unknown> {
    defaultValue: Value;
}

interface CreateBlocksBlockOptions<AdditionalItemFields extends Record<string, unknown>> {
    name: string;
    displayName?: ReactNode;
    supportedBlocks: Record<BlockType, BlockInterface>;
    maxVisibleBlocks?: number;
    additionalItemFields?: {
        [Key in keyof AdditionalItemFields]: BlocksBlockAdditionalItemField<AdditionalItemFields[Key]>;
    };
    AdditionalItemContextMenuItems?: FunctionComponent<{
        item: BlocksBlockItem<BlockInterface, AdditionalItemFields>;
        onChange: (item: BlocksBlockItem<BlockInterface, AdditionalItemFields>) => void;
        onMenuClose: () => void;
        openDialog: BlockRowMenuApi["openDialog"];
    }>;
    AdditionalItemContent?: FunctionComponent<{ item: BlocksBlockItem<BlockInterface, AdditionalItemFields> }>;
    tags?: Array<MessageDescriptor | string>;
}

export function createBlocksBlock<AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields>(
    {
        supportedBlocks,
        name,
        displayName = <FormattedMessage id="dextinity.blocks.blocks.name" defaultMessage="Blocks" />,
        maxVisibleBlocks,
        additionalItemFields,
        AdditionalItemContextMenuItems,
        AdditionalItemContent,
        tags,
    }: CreateBlocksBlockOptions<AdditionalItemFields>,
    override?: (
        block: BlockInterface<
            BlocksBlockFragment<AdditionalItemFields>,
            BlocksBlockState<AdditionalItemFields>,
            BlocksBlockOutput<AdditionalItemFields>
        >,
    ) => BlockInterface<BlocksBlockFragment<AdditionalItemFields>, BlocksBlockState<AdditionalItemFields>, BlocksBlockOutput<AdditionalItemFields>>,
): BlockInterface<BlocksBlockFragment<AdditionalItemFields>, BlocksBlockState<AdditionalItemFields>, BlocksBlockOutput<AdditionalItemFields>> {
    if (Object.keys(supportedBlocks).length === 0) {
        throw new Error("Blocks block with no supported block is not allowed. Please specify at least two supported blocks.");
    }

    if (Object.keys(supportedBlocks).length === 1) {
        throw new Error("Blocks block with a single block is not allowed. Please use a list block (createListBlock()) instead.");
    }

    function blockForType(type: string): BlockInterface | null {
        return supportedBlocks[type] ?? null;
    }

    function typeForBlock(targetBlock: Pick<BlockInterface, "name">): string | null {
        return Object.entries(supportedBlocks).find(([, block]) => block.name === targetBlock.name)?.[0] ?? null;
    }

    const childTags = Object.values(supportedBlocks).reduce<Array<MessageDescriptor | string>>((acc, block) => {
        if (block.tags) {
            return [...acc, ...block.tags];
        }
        return acc;
    }, []);

    const BlocksBlock: BlockInterface<
        BlocksBlockFragment<AdditionalItemFields>,
        BlocksBlockState<AdditionalItemFields>,
        BlocksBlockOutput<AdditionalItemFields>
    > = {
        ...createBlockSkeleton(),

        name,

        displayName,

        tags: tags ? tags : childTags,

        defaultValues: () => ({ blocks: [] }),

        input2State: (input) => {
            const blocks: BlocksBlockItem<BlockInterface, AdditionalItemFields>[] = [];

            for (const child of input.blocks) {
                const block = blockForType(child.type);

                if (!block) {
                    console.warn(`Unknown block type "${child.type}"`);
                    continue;
                }

                blocks.push({
                    ...child,
                    props: block.input2State(child.props),
                    ...Object.keys(additionalItemFields ?? {}).reduce((fields, field) => ({ ...fields, [field]: child[field] }), {}),
                    selected: false,
                    slideIn: false,
                });
            }

            return {
                blocks,
            };
        },

        state2Output: (state) => {
            return {
                blocks: state.blocks.map((child) => {
                    const block = blockForType(child.type);
                    if (!block) {
                        throw new Error(`No Block found for type ${child.type}`); // for TS
                    }
                    return {
                        key: child.key,
                        visible: child.visible,
                        type: child.type,
                        props: block.state2Output(child.props),
                        // Type cast to suppress "'AdditionalItemFields' could be instantiated with a different subtype of constraint 'Record<string, unknown>'" error
                        ...(Object.keys(additionalItemFields ?? {}).reduce(
                            (fields, field) => ({ ...fields, [field]: child[field] }),
                            {},
                        ) as AdditionalItemFields),
                    };
                }),
            };
        },

        output2State: async (output, context) => {
            const state: BlocksBlockState<AdditionalItemFields> = {
                blocks: [],
            };

            for (const child of output.blocks) {
                const block = blockForType(child.type);

                if (!block) {
                    throw new Error(`No Block found for type ${child.type}`);
                }

                state.blocks.push({
                    slideIn: false,
                    ...child,
                    props: await block.output2State(child.props, context),
                    selected: false,
                });
            }

            return state;
        },

        createPreviewState: (state, previewCtx) => {
            return {
                adminRoute: previewCtx.parentUrl,
                blocks: state.blocks
                    .filter((child) => (previewCtx.showVisibleOnly ? child.visible : true)) // depending on context show all blocks or only visible blocks
                    .map((child) => {
                        const blockAdminRoute = `${previewCtx.parentUrlSubRoute ?? previewCtx.parentUrl}/${child.key}/blocks`;
                        const block = blockForType(child.type);
                        if (!block) {
                            throw new Error(`No Block found for type ${child.type}`); // for TS
                        }
                        return {
                            key: child.key,
                            visible: child.visible,
                            type: child.type,
                            adminRoute: blockAdminRoute,
                            props: block.createPreviewState(child.props, { ...previewCtx, parentUrlSubRoute: undefined, parentUrl: blockAdminRoute }),
                            // Type cast to suppress "'AdditionalItemFields' could be instantiated with a different subtype of constraint 'Record<string, unknown>'" error
                            ...(Object.keys(additionalItemFields ?? {}).reduce(
                                (fields, field) => ({ ...fields, [field]: child[field] }),
                                {},
                            ) as AdditionalItemFields),
                        };
                    }),
                adminMeta: { route: previewCtx.parentUrl },
            };
        },
        isValid: async (state) =>
            parallelAsyncEvery(state.blocks, async (c) => {
                const block = blockForType(c.type);
                if (!block) {
                    throw new Error(`No Block found for type ${c.type}`); // for TS
                }
                return block.isValid(c.props);
            }),
        childBlockCount: (state) => state.blocks.length,

        anchors: (state) => {
            return state.blocks.reduce<string[]>((anchors, child) => {
                const block = blockForType(child.type);
                if (!block) {
                    throw new Error(`No Block found for type ${child.type}`); // for TS
                }
                return [...anchors, ...(block.anchors?.(child.props) ?? [])];
            }, []);
        },

        dependencies: (state) => {
            const mergedDependencies = state.blocks.reduce<BlockDependency[]>((dependencies, child) => {
                const block = blockForType(child.type);
                if (!block) {
                    throw new Error(`No Block found for type ${child.type}`); // for TS
                }
                return [...dependencies, ...(block.dependencies?.(child.props) ?? [])];
            }, []);

            return deduplicateBlockDependencies(mergedDependencies);
        },

        replaceDependenciesInOutput: (output, replacements) => {
            const newOutput: BlocksBlockOutput<AdditionalItemFields> = { blocks: [] };

            for (const child of output.blocks) {
                const block = blockForType(child.type);
                if (!block) {
                    throw new Error(`No Block found for type ${child.type}`);
                }

                newOutput.blocks.push({ ...child, props: block.replaceDependenciesInOutput(child.props, replacements) });
            }

            return newOutput;
        },

        definesOwnPadding: true,

        AdminComponent: ({ state, updateState }) => {
            const intl = useIntl();
            const context = useBlockContext();
            const [showAddBlockDrawer, setShowAddBlockDrawer] = useState(false);
            const [beforeIndex, setBeforeIndex] = useState<number>();
            const [cannotPasteBlockError, setCannotPasteBlockError] = useState<ReactNode>();
            const { toasts, dismissToast, perform } = useBlockListToasts();

            const totalVisibleBlocks = state.blocks.filter((block) => block.visible).length;
            const isMaxVisibleBlocksReached = !!maxVisibleBlocks && totalVisibleBlocks >= maxVisibleBlocks;

            useEffect(() => {
                if (state.blocks.some((block) => block.slideIn)) {
                    const timeoutHandle = window.setTimeout(() => {
                        updateState((prevState) => ({ ...prevState, blocks: prevState.blocks.map((block) => ({ ...block, slideIn: false })) }));
                    }, 1000);

                    return () => {
                        window.clearTimeout(timeoutHandle);
                    };
                }
            }, [state.blocks, updateState]);

            const toggleVisible = (blockKey: string) => {
                updateState((prevState) => ({
                    ...prevState,
                    blocks: prevState.blocks.map((c) => (c.key === blockKey ? { ...c, visible: !c.visible } : c)),
                }));
            };

            const setVisibleOfSelectedBlocks = (visible: boolean) => {
                updateState((prevState) => ({
                    ...prevState,
                    blocks: prevState.blocks.map((c) => (c.selected ? { ...c, visible } : c)),
                }));
            };

            const restoreBlocks = (removedBlocks: RemovedBlocksBlockItem<BlockInterface, AdditionalItemFields>[]) => {
                updateState((prevState) => {
                    const blocks = [...prevState.blocks];
                    for (const removedBlock of removedBlocks) {
                        const { removedAt } = removedBlock;
                        const block: BlocksBlockItem<BlockInterface, AdditionalItemFields> = { ...removedBlock };
                        delete block.removedAt;
                        blocks.splice(removedAt, 0, block);
                    }

                    return { ...prevState, blocks };
                });
            };

            const deleteBlocks = (blockKeys: string[]) => {
                const removedBlocks = state.blocks
                    .map((block, index) => ({ ...block, removedAt: index }))
                    .filter((block) => blockKeys.includes(block.key));

                if (removedBlocks.length === 0) {
                    return;
                }

                perform({
                    run: () => updateState((prevState) => ({ ...prevState, blocks: prevState.blocks.filter((c) => !blockKeys.includes(c.key)) })),
                    undo: () => restoreBlocks(removedBlocks),
                    message: intl.formatMessage(
                        { id: "dextinity.blocks.list.blocksDeleted", defaultMessage: "{count, plural, one {Block} other {# blocks}} deleted" },
                        { count: removedBlocks.length },
                    ),
                });
            };

            const addNewBlock = (type: BlockType, beforeIndex?: number) => {
                const key = uuid();

                const block = blockForType(type);
                if (!block) {
                    throw new Error(`No Block found for type ${type}`);
                }
                const newItem: BlocksBlockItem<BlockInterface, AdditionalItemFields> = {
                    key,
                    type,
                    visible: maxVisibleBlocks ? totalVisibleBlocks < maxVisibleBlocks : true,
                    selected: false,
                    props: block.defaultValues(),
                    slideIn: true,
                    ...(Object.entries(additionalItemFields ?? {}).reduce(
                        (fields, [field, { defaultValue }]) => ({ ...fields, [field]: defaultValue }),
                        {},
                    ) as AdditionalItemFields),
                };

                updateState((prevState) => {
                    const blocks = [...prevState.blocks];
                    blocks.splice(beforeIndex ?? blocks.length, 0, newItem);
                    return { ...prevState, blocks };
                });

                return key;
            };

            const moveBlock = (fromIndex: number, toIndex: number) => {
                updateState((prevState) => {
                    const blocks = [...prevState.blocks];
                    const [blockToMove] = blocks.splice(fromIndex, 1);
                    blocks.splice(toIndex, 0, blockToMove);
                    return { ...prevState, blocks };
                });
            };

            const duplicateBlock = async (blockKey: string) => {
                const original = state.blocks.find((item) => item.key === blockKey);
                const block = original ? blockForType(original.type) : null;
                if (!original || !block) {
                    return;
                }

                const props = await block.output2State(block.state2Output(original.props), context);

                updateState((prevState) => {
                    const index = prevState.blocks.findIndex((item) => item.key === blockKey);
                    const blocks = [...prevState.blocks];
                    blocks.splice(index + 1, 0, {
                        ...original,
                        key: uuid(),
                        props,
                        visible: original.visible && !isMaxVisibleBlocksReached,
                        selected: false,
                        slideIn: true,
                    });
                    return { ...prevState, blocks };
                });
            };

            const createUpdateSubBlocksFn = useCallback(
                (blockKey: string) => {
                    const updateSubBlocksFn: Dispatch<SetStateAction<unknown>> = (setStateAction) => {
                        updateState((prevState) => ({
                            ...prevState,
                            blocks: prevState.blocks.map((c) =>
                                c.key === blockKey ? { ...c, props: resolveNewState({ prevState: c.props, setStateAction }) } : c,
                            ),
                        }));
                    };
                    return updateSubBlocksFn;
                },
                [updateState],
            );

            const { scope } = useContentScope();
            const { isBlockSupported } = useBlocksConfig();

            const filteredSupportedBlocks = useMemo(() => {
                if (isBlockSupported) {
                    return Object.fromEntries(Object.entries(supportedBlocks).filter(([, block]) => isBlockSupported(block, scope)));
                } else {
                    return supportedBlocks;
                }
            }, [scope, isBlockSupported]);

            const {
                updateClipboardContent,
                getClipboardContent,
                progressDialog: clipboardProgressDialog,
            } = useBlockClipboard({ supports: Object.values(filteredSupportedBlocks) });

            const pasteBlock = async (insertAt: number) => {
                const response = await getClipboardContent();

                if (!response.canPaste) {
                    setCannotPasteBlockError(response.error);
                    return;
                }

                const { content } = response;

                updateState((prevState) => {
                    const clipboardVisibleBlocks = content.filter((block) => block.visible).length;
                    const canAddVisibleBlock = maxVisibleBlocks ? totalVisibleBlocks + clipboardVisibleBlocks <= maxVisibleBlocks : true;

                    const newBlocks: BlocksBlockItem<BlockInterface, AdditionalItemFields>[] = content.map((block) => {
                        const type = typeForBlock(block);

                        if (!type) {
                            throw new Error(`No type found for block "${block.name}"`);
                        }

                        return {
                            key: uuid(),
                            type,
                            selected: false,
                            visible: canAddVisibleBlock ? block.visible : false,
                            props: block.state,
                            slideIn: true,
                            // Type cast to suppress "'AdditionalItemFields' could be instantiated with a different subtype of constraint 'Record<string, unknown>'" error
                            ...(block.additionalFields as AdditionalItemFields),
                        };
                    });

                    return {
                        ...prevState,
                        blocks: [...prevState.blocks.slice(0, insertAt), ...newBlocks, ...prevState.blocks.slice(insertAt)].map((block) => ({
                            ...block,
                            selected: false,
                        })),
                    };
                });
            };

            const handleAddBlockClick = (beforeIndex?: number) => {
                setShowAddBlockDrawer(true);
                setBeforeIndex(beforeIndex);
            };

            const handleCloseAddBlockDrawer = () => {
                setShowAddBlockDrawer(false);
                setBeforeIndex(undefined);
            };

            const selectAllBlocks = (selected: boolean) => {
                updateState((prevState) => ({
                    ...prevState,
                    blocks: prevState.blocks.map((block) => ({ ...block, selected })),
                }));
            };

            const selectBlock = (blockKey: string, selected: boolean) => {
                updateState((prevState) => ({
                    ...prevState,
                    blocks: prevState.blocks.map((block) => (block.key === blockKey ? { ...block, selected } : block)),
                }));
            };

            const copyBlocks = (items: BlocksBlockItem<BlockInterface, AdditionalItemFields>[]) => {
                const blocksToCopy = items.map((item) => {
                    const block = blockForType(item.type);

                    if (!block) {
                        throw new Error(`No Block found for type ${item.type}`);
                    }

                    return {
                        name: block.name,
                        visible: item.visible,
                        state: item.props,
                        additionalFields: Object.keys(additionalItemFields ?? {}).reduce(
                            (fields, field) => ({ ...fields, [field]: item[field] }),
                            {},
                        ),
                    };
                });

                updateClipboardContent(blocksToCopy);
            };

            const selectedCount = state.blocks.filter((block) => block.selected).length;
            const maxVisibleBlocksReason = intl.formatMessage(
                { id: "dextinity.blocks.block.maxVisibleBlocks", defaultMessage: "Max. visible blocks allowed: {maxVisibleBlocks}" },
                { maxVisibleBlocks },
            );

            return (
                <>
                    <StackSwitch disableForcePromptRoute>
                        <StackPage name="main">
                            <StackSwitchApiContext.Consumer>
                                {(stackApi) => {
                                    return (
                                        <SelectPreviewComponent>
                                            <BlockRowList
                                                aria-label={messageText(intl, displayName) ?? name}
                                                addLabel={intl.formatMessage({
                                                    id: "dextinity.blocks.list.addNewBlock",
                                                    defaultMessage: "Add block",
                                                })}
                                                count={state.blocks.length}
                                                selectedCount={selectedCount}
                                                onSelectAllChange={selectAllBlocks}
                                                onAdd={handleAddBlockClick}
                                                onReorder={moveBlock}
                                                bulkActions={{
                                                    onShow: maxVisibleBlocks ? undefined : () => setVisibleOfSelectedBlocks(true),
                                                    onHide: maxVisibleBlocks ? undefined : () => setVisibleOfSelectedBlocks(false),
                                                    onCopy: () => copyBlocks(state.blocks.filter((block) => block.selected)),
                                                    onPaste: () => pasteBlock(0),
                                                    onDelete: () =>
                                                        deleteBlocks(state.blocks.filter((block) => block.selected).map((block) => block.key)),
                                                }}
                                                toasts={toasts}
                                                onDismissToast={dismissToast}
                                            >
                                                {state.blocks.map((data, blockIndex) => {
                                                    const block = blockForType(data.type);
                                                    if (!block) {
                                                        return null;
                                                    }

                                                    return (
                                                        <BlockRow
                                                            key={data.key}
                                                            block={block}
                                                            state={data.props}
                                                            previewSlug={`${data.key}/blocks`}
                                                            visible={data.visible}
                                                            onVisibleChange={() => toggleVisible(data.key)}
                                                            visibilityRestriction={
                                                                isMaxVisibleBlocksReached && !data.visible
                                                                    ? { reason: maxVisibleBlocksReason, canToggle: false }
                                                                    : undefined
                                                            }
                                                            checked={data.selected}
                                                            onCheckedChange={(checked) => selectBlock(data.key, checked)}
                                                            onOpen={() => stackApi.activatePage("blocks", data.key)}
                                                            onCopy={() => copyBlocks([data])}
                                                            onPaste={() => pasteBlock(blockIndex + 1)}
                                                            onDuplicate={() => duplicateBlock(data.key)}
                                                            onDelete={() => deleteBlocks([data.key])}
                                                            renderAdditionalMenuItems={
                                                                AdditionalItemContextMenuItems
                                                                    ? ({ closeMenu, openDialog }) => (
                                                                          <AdditionalItemContextMenuItems
                                                                              item={data}
                                                                              onChange={(updatedItem) => {
                                                                                  updateState((previousState) => ({
                                                                                      blocks: previousState.blocks.map((block) =>
                                                                                          block.key === data.key ? updatedItem : block,
                                                                                      ),
                                                                                  }));
                                                                              }}
                                                                              onMenuClose={closeMenu}
                                                                              openDialog={openDialog}
                                                                          />
                                                                      )
                                                                    : undefined
                                                            }
                                                            additionalContent={
                                                                AdditionalItemContent ? <AdditionalItemContent item={data} /> : undefined
                                                            }
                                                        />
                                                    );
                                                })}
                                            </BlockRowList>
                                            <AddBlockDrawer
                                                open={showAddBlockDrawer}
                                                onClose={handleCloseAddBlockDrawer}
                                                blocks={filteredSupportedBlocks}
                                                onAddNewBlock={(type, addAndEdit) => {
                                                    const key = addNewBlock(type, beforeIndex);

                                                    if (addAndEdit) {
                                                        stackApi.activatePage("blocks", key);
                                                    }
                                                }}
                                            />
                                        </SelectPreviewComponent>
                                    );
                                }}
                            </StackSwitchApiContext.Consumer>
                        </StackPage>
                        <StackPage
                            name="blocks"
                            title={intl.formatMessage({ id: "dextinity.blocks.blocks.editBlock", defaultMessage: "Edit block" })}
                        >
                            {(id) => (
                                <StackSwitchApiContext.Consumer>
                                    {(stackApi) => {
                                        const match = state.blocks.find((c) => c.key === id);

                                        if (!match) {
                                            stackApi.activatePage("main", "");
                                            return;
                                        }

                                        const block = blockForType(match.type);

                                        if (!block) {
                                            stackApi.activatePage("main", "");
                                            return;
                                        }

                                        return (
                                            <StackPageTitle title={block.displayName}>
                                                <block.AdminComponent key={id} state={match.props} updateState={createUpdateSubBlocksFn(id)} />
                                            </StackPageTitle>
                                        );
                                    }}
                                </StackSwitchApiContext.Consumer>
                            )}
                        </StackPage>
                    </StackSwitch>
                    {cannotPasteBlockError !== undefined && (
                        <CannotPasteBlockDialog open onClose={() => setCannotPasteBlockError(undefined)} error={cannotPasteBlockError} />
                    )}
                    {clipboardProgressDialog}
                </>
            );
        },
        previewContent: (state, ctx) => {
            if (state.blocks.length === 0) {
                return [
                    {
                        type: "text",
                        content: (
                            <FormattedMessage
                                id="dextinity.blocks.list.count"
                                defaultMessage="{count, plural, =0 {No blocks} one {# block} other {# blocks}}"
                                values={{ count: state.blocks.length }}
                            />
                        ),
                    },
                ];
            }
            return state.blocks.reduce<PreviewContent[]>((prev, next) => {
                const block = blockForType(next.type);
                if (block) {
                    const nextPreviewContent = block.previewContent(next.props, ctx);
                    return [...prev, ...nextPreviewContent];
                } else {
                    return prev;
                }
            }, []);
        },
        resolveDependencyPath: (state, jsonPath) => {
            if (!/^blocks.\d+.props/.test(jsonPath)) {
                throw new Error("BlocksBlock: Invalid jsonPath");
            }

            const pathArr = jsonPath.split(".");
            const num = Number(pathArr[1]);
            const blockItem = state.blocks[num];

            const block = blockForType(blockItem.type);

            if (block === null) {
                throw new Error("BlocksBlock: Block is null");
            }

            const childPath = block.resolveDependencyPath(blockItem.props, pathArr.slice(3).join("."));
            return `${blockItem.key}/blocks/${childPath}`;
        },
        extractTextContents: (state, options) => {
            const includeInvisibleContent = options?.includeInvisibleContent ?? false;

            return state.blocks.reduce<string[]>((content, child) => {
                const block = blockForType(child.type);
                if (!block) {
                    throw new Error(`No Block found for type ${child.type}`); // for TS
                }

                if (!child.visible && !includeInvisibleContent) {
                    return content;
                }

                return [...content, ...(block.extractTextContents?.(child.props, options) ?? [])];
            }, []);
        },
        translateContent: async (state, translate) => {
            const translatedBlocks = await Promise.all(
                state.blocks.map(async (child) => {
                    const block = blockForType(child.type);
                    if (!block) {
                        throw new Error(`No Block found for type ${child.type}`);
                    }

                    const translatedProps = block.translateContent ? await block.translateContent(child.props, translate) : child.props;
                    return { ...child, props: translatedProps };
                }),
            );
            return { ...state, blocks: translatedBlocks };
        },
    };

    if (override) {
        return override(BlocksBlock);
    }

    return BlocksBlock;
}
