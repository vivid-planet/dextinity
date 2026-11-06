import { StackPage, StackSwitch, StackSwitchApiContext } from "@dextinity/admin";
import { Fragment, type FunctionComponent, type ReactNode } from "react";
import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { BlockRow, type BlockRowMenuApi, type BlockRowVisibilityRestriction } from "../common/blockRow/BlockRow";
import { BlockRowList } from "../common/blockRow/BlockRowList";
import { messageText } from "../form/messageText";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { deduplicateBlockDependencies } from "../helpers/deduplicateBlockDependencies";
import { SelectPreviewComponent } from "../iframebridge/SelectPreviewComponent";
import type { BlockDependency, BlockInterface, BlockState, PreviewContent } from "../types";
import { parallelAsyncEvery } from "../utils/parallelAsyncEvery";
import { createUseAdminComponent } from "./listBlock/createUseAdminComponent";

// Using {} instead of Record<string, never> because never and unknown are incompatible.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type DefaultAdditionalItemFields = {};

export type ListBlockItem<T extends BlockInterface, AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields> = {
    [key: string]: unknown;
    key: string;
    visible: boolean;
    props: BlockState<T>;
    selected: boolean;
    slideIn: boolean;
} & AdditionalItemFields;

export interface ListBlockState<T extends BlockInterface, AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields> {
    blocks: ListBlockItem<T, AdditionalItemFields>[];
}

export interface ListBlockFragment<AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields> {
    blocks: Array<
        {
            [key: string]: unknown;
            key: string;
            visible: boolean;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            props: any;
        } & AdditionalItemFields
    >;
}

export interface ListBlockOutput<AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields> {
    blocks: Array<
        {
            [key: string]: unknown;
            key: string;
            visible: boolean;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            props: any;
        } & AdditionalItemFields
    >;
}

export interface ListBlockAdditionalItemField<Value = unknown> {
    defaultValue: Value;
}

interface CreateListBlockOptions<T extends BlockInterface, AdditionalItemFields extends Record<string, unknown>> {
    name: string;
    displayName?: ReactNode;
    itemName?: ReactNode;
    itemsName?: ReactNode;
    block: T;
    minVisibleBlocks?: number;
    maxVisibleBlocks?: number;
    createDefaultListEntry?: boolean;
    additionalItemFields?: {
        [Key in keyof AdditionalItemFields]: ListBlockAdditionalItemField<AdditionalItemFields[Key]>;
    };
    AdditionalItemContextMenuItems?: FunctionComponent<{
        item: ListBlockItem<T, AdditionalItemFields>;
        onChange: (item: ListBlockItem<T, AdditionalItemFields>) => void;
        onMenuClose: () => void;
        openDialog: BlockRowMenuApi["openDialog"];
    }>;
    AdditionalItemContent?: FunctionComponent<{ item: ListBlockItem<T, AdditionalItemFields> }>;
    tags?: Array<MessageDescriptor | string>;
}

export function createListBlock<T extends BlockInterface, AdditionalItemFields extends Record<string, unknown> = DefaultAdditionalItemFields>(
    {
        name,
        block,
        displayName = <FormattedMessage id="dextinity.blocks.listBlock.name" defaultMessage="List" />,
        itemName = <FormattedMessage id="dextinity.blocks.listBlock.itemName" defaultMessage="block" />,
        itemsName = <FormattedMessage id="dextinity.blocks.listBlock.itemsName" defaultMessage="blocks" />,
        minVisibleBlocks,
        maxVisibleBlocks,
        createDefaultListEntry,
        additionalItemFields,
        AdditionalItemContextMenuItems,
        AdditionalItemContent,
        tags,
    }: CreateListBlockOptions<T, AdditionalItemFields>,
    override?: (
        block: BlockInterface<
            ListBlockFragment<AdditionalItemFields>,
            ListBlockState<T, AdditionalItemFields>,
            ListBlockOutput<AdditionalItemFields>
        >,
    ) => BlockInterface<ListBlockFragment<AdditionalItemFields>, ListBlockState<T, AdditionalItemFields>, ListBlockOutput<AdditionalItemFields>>,
): BlockInterface<ListBlockFragment<AdditionalItemFields>, ListBlockState<T, AdditionalItemFields>, ListBlockOutput<AdditionalItemFields>> {
    const useAdminComponent = createUseAdminComponent({ block, maxVisibleBlocks, additionalItemFields });
    if (minVisibleBlocks && maxVisibleBlocks && minVisibleBlocks > maxVisibleBlocks) {
        throw new Error(
            `${name}: The property 'minVisibleBlocks' (value: ${minVisibleBlocks}) must be equal to or smaller than 'maxVisibleBlocks' (value: ${maxVisibleBlocks})`,
        );
    }

    const getDefaultListEntry = () => ({
        key: uuid(),
        visible: true,
        props: block.defaultValues(),
        selected: false,
        slideIn: false,
        // Type cast to suppress "'AdditionalItemFields' could be instantiated with a different subtype of constraint 'Record<string, unknown>'" error
        ...(Object.entries(additionalItemFields ?? {}).reduce(
            (fields, [field, { defaultValue }]) => ({ ...fields, [field]: defaultValue }),
            {},
        ) as AdditionalItemFields),
    });

    const BlockListBlock: BlockInterface<
        ListBlockFragment<AdditionalItemFields>,
        ListBlockState<T, AdditionalItemFields>,
        ListBlockOutput<AdditionalItemFields>
    > = {
        ...createBlockSkeleton(),

        name,

        displayName,

        tags: tags ? tags : block.tags,

        defaultValues: () => ({
            blocks:
                minVisibleBlocks !== undefined
                    ? Array.from({ length: minVisibleBlocks }, getDefaultListEntry)
                    : createDefaultListEntry
                      ? [getDefaultListEntry()]
                      : [],
        }),

        category: block.category,

        input2State: (input) => {
            return {
                ...input,
                blocks: input.blocks.map((child) => {
                    return {
                        ...child,
                        key: child.key,
                        visible: child.visible,
                        props: block.input2State(child.props),
                        ...Object.keys(additionalItemFields ?? {}).reduce((fields, field) => ({ ...fields, [field]: child[field] }), {}),
                        selected: false,
                        slideIn: false,
                    };
                }),
            };
        },

        state2Output: (state) => {
            return {
                blocks: state.blocks.map((child) => {
                    return {
                        key: child.key,
                        visible: child.visible,
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
            const state: ListBlockState<T, AdditionalItemFields> = {
                blocks: [],
            };

            for (const child of output.blocks) {
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
                        const blockAdminRoute = `${previewCtx.parentUrlSubRoute ?? previewCtx.parentUrl}/${child.key}/edit`;

                        return {
                            key: child.key,
                            visible: child.visible,
                            props: block.createPreviewState(child.props, {
                                ...previewCtx,
                                parentUrlSubRoute: undefined,
                                parentUrl: blockAdminRoute,
                            }),
                            // Type cast to suppress "'AdditionalItemFields' could be instantiated with a different subtype of constraint 'Record<string, unknown>'" error
                            ...(Object.keys(additionalItemFields ?? {}).reduce(
                                (fields, field) => ({ ...fields, [field]: child[field] }),
                                {},
                            ) as AdditionalItemFields),
                            adminRoute: blockAdminRoute,
                            adminMeta: { route: blockAdminRoute },
                        };
                    }),
                adminMeta: { route: previewCtx.parentUrl },
            };
        },
        isValid: async (state) => {
            const blockValidityResult = await parallelAsyncEvery(state.blocks, async (c) => block.isValid(c.props));
            return blockValidityResult && (minVisibleBlocks ? minVisibleBlocks <= state.blocks.filter((block) => block.visible).length : true);
        },

        childBlockCount: (state) => state.blocks.length,

        anchors: (state) => {
            return state.blocks.reduce<string[]>((anchors, child) => {
                return [...anchors, ...(block.anchors?.(child.props) ?? [])];
            }, []);
        },

        dependencies: (state) => {
            const mergedDependencies = state.blocks.reduce<BlockDependency[]>((dependencies, child) => {
                return [...dependencies, ...(block.dependencies?.(child.props) ?? [])];
            }, []);

            return deduplicateBlockDependencies(mergedDependencies);
        },

        replaceDependenciesInOutput: (output, replacements) => {
            const newOutput: ListBlockOutput<AdditionalItemFields> = { ...output, blocks: [] };

            for (const child of output.blocks) {
                newOutput.blocks.push({
                    ...child,
                    props: block.replaceDependenciesInOutput(child.props, replacements),
                });
            }

            return newOutput;
        },

        definesOwnPadding: true,

        AdminComponent: ({ state, updateState }) => {
            const intl = useIntl();
            const {
                cannotPasteBlockErrorDialog,
                clipboardProgressDialog,
                toasts,
                dismissToast,
                createUpdateSubBlocksFn,
                totalVisibleBlocks,
                addNewBlock,
                moveBlock,
                duplicateBlock,
                copyBlock,
                copySelectedBlocks,
                deleteAllSelectedBlocks,
                selectBlock,
                selectAllBlocks,
                pasteBlock,
                selectedCount,
                toggleVisible,
                setVisibleOfSelectedBlocks,
                deleteBlocks,
                // @ts-expect-error missing AdditionalItemFields generic in createUseAdminComponent
            } = useAdminComponent({ state, updateState });

            const isMinVisibleBlocksMet = !!minVisibleBlocks && totalVisibleBlocks >= minVisibleBlocks;
            const isMaxVisibleBlocksReached = !!maxVisibleBlocks && totalVisibleBlocks >= maxVisibleBlocks;

            const visibilityRestrictionFor = (item: ListBlockItem<T, AdditionalItemFields>): BlockRowVisibilityRestriction | undefined => {
                if (isMaxVisibleBlocksReached && !item.visible) {
                    return {
                        reason: intl.formatMessage(
                            { id: "dextinity.blocks.list.maxVisibleBlocks", defaultMessage: "Max. visible blocks allowed: {maxVisibleBlocks}" },
                            { maxVisibleBlocks },
                        ),
                        canToggle: false,
                    };
                }
                if ((!!minVisibleBlocks && !isMinVisibleBlocksMet) || (minVisibleBlocks === totalVisibleBlocks && item.visible)) {
                    return {
                        reason: intl.formatMessage(
                            { id: "dextinity.blocks.list.minVisibleBlocks", defaultMessage: "Min. visible blocks required: {minVisibleBlocks}" },
                            { minVisibleBlocks },
                        ),
                        canToggle: true,
                    };
                }
                return undefined;
            };

            return (
                <SelectPreviewComponent>
                    <StackSwitch disableForcePromptRoute>
                        <StackPage name="table">
                            <StackSwitchApiContext.Consumer>
                                {(stackApi) => (
                                    <BlockRowList
                                        aria-label={messageText(intl, displayName) ?? name}
                                        addLabel={intl.formatMessage(
                                            { id: "dextinity.blocks.list.add", defaultMessage: "Add {itemName}" },
                                            { itemName: messageText(intl, itemName) ?? "" },
                                        )}
                                        count={state.blocks.length}
                                        selectedCount={selectedCount}
                                        onSelectAllChange={selectAllBlocks}
                                        onAdd={(index) => {
                                            const key = addNewBlock(index);
                                            stackApi.activatePage("edit", key);
                                        }}
                                        onReorder={moveBlock}
                                        bulkActions={{
                                            onShow: maxVisibleBlocks ? undefined : () => setVisibleOfSelectedBlocks(true),
                                            onHide: minVisibleBlocks ? undefined : () => setVisibleOfSelectedBlocks(false),
                                            onCopy: copySelectedBlocks,
                                            onPaste: () => pasteBlock(0),
                                            onDelete: deleteAllSelectedBlocks,
                                        }}
                                        toasts={toasts}
                                        onDismissToast={dismissToast}
                                    >
                                        {state.blocks.map((data, blockIndex) => (
                                            <BlockRow
                                                key={data.key}
                                                block={block}
                                                state={data.props}
                                                previewSlug={`${data.key}/edit`}
                                                visible={data.visible}
                                                onVisibleChange={() => toggleVisible(data.key)}
                                                visibilityRestriction={visibilityRestrictionFor(data)}
                                                checked={data.selected}
                                                onCheckedChange={(checked) => selectBlock(data.key, checked)}
                                                onOpen={() => stackApi.activatePage("edit", data.key)}
                                                onCopy={() => copyBlock(data.key)}
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
                                                additionalContent={AdditionalItemContent ? <AdditionalItemContent item={data} /> : undefined}
                                            />
                                        ))}
                                    </BlockRowList>
                                )}
                            </StackSwitchApiContext.Consumer>
                        </StackPage>
                        <StackPage name="edit" title={block.displayName}>
                            {(itemId) => (
                                <StackSwitchApiContext.Consumer>
                                    {(stackApi) => {
                                        const match = state.blocks.find((c) => c.key === itemId);
                                        if (!match) {
                                            stackApi.activatePage("table", "");
                                            return;
                                        }

                                        return (
                                            <block.AdminComponent key={itemId} state={match.props} updateState={createUpdateSubBlocksFn(itemId)} />
                                        );
                                    }}
                                </StackSwitchApiContext.Consumer>
                            )}
                        </StackPage>
                    </StackSwitch>
                    {cannotPasteBlockErrorDialog}
                    {clipboardProgressDialog}
                </SelectPreviewComponent>
            );
        },
        previewContent: (state, ctx) => {
            if (state.blocks.length === 0) {
                return [
                    {
                        type: "text",
                        content: (
                            <FormattedMessage
                                id="dextinity.blocks.list.noBlocks"
                                defaultMessage="No {itemsName}"
                                values={{ itemsName: <Fragment key="itemsName">{itemsName}</Fragment> }}
                            />
                        ),
                    },
                ];
            }

            return state.blocks.reduce<PreviewContent[]>((prev, next) => {
                const nextPreviewContent = block.previewContent(next.props, ctx);
                return [...prev, ...nextPreviewContent];
            }, []);
        },
        resolveDependencyPath: (state, jsonPath) => {
            if (!/^blocks.\d+.props/.test(jsonPath)) {
                throw new Error("ListBlock: Invalid jsonPath");
            }

            const pathArr = jsonPath.split(".");
            const num = Number(pathArr[1]);
            const blockItem = state.blocks[num];

            const childPath = block.resolveDependencyPath(blockItem.props, pathArr.slice(3).join("."));
            return `${blockItem.key}/edit/${childPath}`;
        },
        extractTextContents: (state, options) => {
            const includeInvisibleContent = options?.includeInvisibleContent ?? false;

            const content = state.blocks.reduce<string[]>((content, child) => {
                if (!child.visible && !includeInvisibleContent) {
                    return content;
                }

                return [...content, ...(block.extractTextContents?.(child.props, options) ?? [])];
            }, []);
            return content;
        },
        translateContent: async (state, translate) => {
            const translatedBlocks = await Promise.all(
                state.blocks.map(async (child) => {
                    const translatedProps = block.translateContent ? await block.translateContent(child.props, translate) : child.props;
                    return { ...child, props: translatedProps };
                }),
            );
            return { ...state, blocks: translatedBlocks };
        },
    };
    if (override) {
        return override(BlockListBlock);
    }
    return BlockListBlock;
}
