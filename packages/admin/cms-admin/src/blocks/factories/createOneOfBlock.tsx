import { RadioGroupField, SegmentedControlField, SelectField } from "@dextinity/ui-react-final-form";
import { styled } from "@mui/material/styles";
import { deepEqual } from "fast-equals";
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useMemo } from "react";
import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";

import { useContentScope } from "../../contentScope/Provider";
import { useBlockAdminComponentPaper } from "../common/BlockAdminComponentPaper";
import { HiddenInSubroute } from "../common/HiddenInSubroute";
import { useBlocksConfig } from "../config/BlocksConfigContext";
import { BlocksFinalForm } from "../form/BlocksFinalForm";
import { messageText } from "../form/messageText";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { HoverPreviewComponent } from "../iframebridge/HoverPreviewComponent";
import { SelectPreviewComponent } from "../iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface, type BlockPreviewStateInterface, type BlockState, type CustomBlockCategory } from "../types";
import { resolveNewState } from "../utils";
import { parallelAsyncEvery } from "../utils/parallelAsyncEvery";

interface OneOfBlockItem<T extends BlockInterface = BlockInterface> {
    type: string;
    props: BlockState<T>;
}

export interface OneOfBlockState {
    attachedBlocks: OneOfBlockItem[];
    activeType?: string;
}

export interface OneOfBlockFragment {
    attachedBlocks: {
        type: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: any;
    }[];
    activeType?: string;
    block?: {
        type: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: any;
    };
}

export interface OneOfBlockPreviewState extends BlockPreviewStateInterface {
    block?: {
        type: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: any;
    };
}

type ActiveType<Config extends boolean> = Config extends false ? { activeType: string } : { activeType?: string };

export type OneOfBlockOutput<Config extends boolean> = {
    attachedBlocks: {
        type: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: any;
    }[];
} & ActiveType<Config>;

type BlockType = string;
export interface CreateOneOfBlockOptions<T extends boolean> {
    name: string;
    displayName?: ReactNode;
    supportedBlocks: Record<BlockType, BlockInterface>;
    category?: BlockCategory | CustomBlockCategory;
    variant?: "select" | "radio" | "toggle";
    /**
     * The label of the control that chooses the block. Visible for the `select` variant, the accessible name of the other variants.
     *
     * @defaultValue "Block type"
     */
    label?: ReactNode;
    allowEmpty?: T;
    tags?: Array<MessageDescriptor | string>;
}

export const createOneOfBlock = <T extends boolean = boolean>(
    {
        supportedBlocks,
        name,
        displayName = "Switch",
        category = BlockCategory.Other,
        variant = "select",
        label = <FormattedMessage id="dextinity.blocks.oneOfBlock.blockType" defaultMessage="Block type" />,
        allowEmpty: passedAllowEmpty,
        tags,
    }: CreateOneOfBlockOptions<T>,
    override?: (
        block: BlockInterface<OneOfBlockFragment, OneOfBlockState, OneOfBlockOutput<T>, OneOfBlockPreviewState>,
    ) => BlockInterface<OneOfBlockFragment, OneOfBlockState, OneOfBlockOutput<T>, OneOfBlockPreviewState>,
): BlockInterface<OneOfBlockFragment, OneOfBlockState, OneOfBlockOutput<T>, OneOfBlockPreviewState> => {
    // allowEmpty can't have a default type because it's typed by a generic
    const allowEmpty = (passedAllowEmpty ?? true) satisfies boolean;

    function blockForType(type: string): BlockInterface | null {
        return supportedBlocks[type] ?? null;
    }
    // helper to get common values of the selected block by State
    function getActiveBlock(s: OneOfBlockState) {
        if (!s.activeType) {
            return {
                state: undefined,
                block: undefined,
                type: undefined,
            };
        }
        const activeBlockState = s.attachedBlocks.find((c) => c.type === s.activeType);
        if (!activeBlockState) {
            const attachedTypes = s.attachedBlocks.map((c) => `"${c.type}"`).join(", ");
            let message = `activeType "${s.activeType}" has no entry in attachedBlocks, which ${attachedTypes ? `holds: ${attachedTypes}` : "is empty"}.`;

            if (process.env.NODE_ENV === "development") {
                message += ` One possible cause is a missing "x-include-invisible-content" HTTP header when fetching the block.`;
            }

            throw new Error(message);
        }
        const block = activeBlockState ? blockForType(activeBlockState.type) : undefined;

        return {
            state: activeBlockState,
            block,
            type: activeBlockState.type,
        };
    }

    const childTags = Object.values(supportedBlocks).reduce<Array<MessageDescriptor | string>>((acc, block) => {
        if (block.tags) {
            return [...acc, ...block.tags];
        }
        return acc;
    }, []);

    const OneOfBlock: BlockInterface<OneOfBlockFragment, OneOfBlockState, OneOfBlockOutput<T>, OneOfBlockPreviewState> = {
        ...createBlockSkeleton(),

        name,

        displayName,

        tags: tags ? tags : childTags,

        category,

        defaultValues: () => {
            if (allowEmpty) {
                return {
                    attachedBlocks: [],
                    activeType: undefined,
                };
            } else {
                const [blockType, block] = Object.entries(supportedBlocks)[0];

                return {
                    attachedBlocks: [{ type: blockType, props: block.defaultValues() }],
                    activeType: blockType,
                };
            }
        },

        input2State: ({ attachedBlocks, activeType, block, ...additionalFields }) => {
            const state: OneOfBlockState = {
                ...additionalFields,
                attachedBlocks: [],
                activeType: activeType && supportedBlocks[activeType] ? activeType : undefined,
            };

            for (const item of attachedBlocks) {
                const block = blockForType(item.type);

                if (!block) {
                    console.warn(`Unknown block type "${item.type}"`);
                    continue;
                }

                state.attachedBlocks.push({ ...item, props: block.input2State(item.props) });
            }

            return state;
        },
        state2Output: ({ attachedBlocks, activeType, ...additionalFields }) => {
            return {
                ...additionalFields,
                attachedBlocks: attachedBlocks.map((c) => {
                    const block = blockForType(c.type);
                    if (!block) {
                        throw new Error(`No Block found for type ${c.type}`); // for TS
                    }
                    return {
                        type: c.type,
                        props: block.state2Output(c.props),
                    };
                }),
                activeType,
            } as OneOfBlockOutput<T>;
        },

        output2State: async ({ attachedBlocks, activeType, ...additionalFields }, context) => {
            const state: OneOfBlockState = {
                attachedBlocks: [],
                activeType,
            };

            for (const item of attachedBlocks) {
                const block = blockForType(item.type);

                if (!block) {
                    throw new Error(`No Block found for type ${item.type}`);
                }

                state.attachedBlocks.push({
                    ...item,
                    props: await block.output2State(item.props, context),
                });
            }

            return state;
        },

        createPreviewState: (state, previewCtx) => {
            const { state: blockState, block } = getActiveBlock(state);
            const { attachedBlocks, activeType, ...additionalFields } = state;

            return {
                ...additionalFields,
                block: blockState
                    ? {
                          type: blockState.type,
                          props: {
                              ...block?.createPreviewState(blockState.props, previewCtx),
                              adminMeta: { route: `${previewCtx.parentUrl}#${blockState.type}` },
                          },
                      }
                    : undefined,
            };
        },

        isValid: async (state) =>
            parallelAsyncEvery(state.attachedBlocks, async (c) => {
                const block = blockForType(c.type);
                if (!block) {
                    throw new Error(`No Block found for type ${c.type}`); // for TS
                }
                return block.isValid(c.props);
            }),

        anchors: (state) => {
            const { state: blockState, block } = getActiveBlock(state);

            if (blockState === undefined) {
                return [];
            }

            return block?.anchors?.(blockState.props) ?? [];
        },

        dependencies: (state) => {
            const { state: blockState, block } = getActiveBlock(state);

            if (blockState === undefined) {
                return [];
            }

            return block?.dependencies?.(blockState.props) ?? [];
        },

        replaceDependenciesInOutput: (output, replacements) => {
            const newOutput: OneOfBlockOutput<T> = { ...output, attachedBlocks: [] };

            for (const c of output.attachedBlocks) {
                const block = blockForType(c.type);
                if (!block) {
                    throw new Error(`No Block found for type ${c.type}`); // for TS
                }

                newOutput.attachedBlocks.push({
                    ...c,
                    props: block.replaceDependenciesInOutput(c.props, replacements),
                });
            }

            return newOutput;
        },

        definesOwnPadding: true,

        AdminComponent: ({ state, updateState }) => {
            const isInPaper = useBlockAdminComponentPaper();

            const { scope } = useContentScope();
            const { isBlockSupported } = useBlocksConfig();

            const options = useMemo(() => {
                let filteredSupportedBlocks;

                if (isBlockSupported) {
                    filteredSupportedBlocks = Object.fromEntries(
                        Object.entries(supportedBlocks).filter(([, block]) => isBlockSupported(block, scope)),
                    );
                } else {
                    filteredSupportedBlocks = supportedBlocks;
                }

                const options: Array<{ value: string; label: ReactNode }> = allowEmpty
                    ? [{ value: "none", label: <FormattedMessage id="dextinity.blocks.oneOfBlock.empty" defaultMessage="None" /> }]
                    : [];

                Object.entries(filteredSupportedBlocks).forEach(([blockType, block]) => {
                    options.push({
                        value: blockType,
                        label: block.displayName,
                    });
                });

                return options;
            }, [scope, isBlockSupported]);

            const handleBlockSelect = useCallback(
                (blockType: string) => {
                    updateState((prevState) => {
                        let newState: OneOfBlockState = prevState;
                        if (blockType === "none") {
                            // unselect, no block selected
                            newState = { ...prevState, activeType: undefined };
                        } else {
                            // check if we have a block of the same type already
                            const match = prevState.attachedBlocks.find((c) => c.type === blockType);
                            if (match) {
                                // we have an existing block with same type, so select it
                                newState = {
                                    ...prevState,
                                    activeType: blockType,
                                };
                            } else {
                                // we have no existing block, we need to create and select a new block
                                const block = blockForType(blockType);
                                if (!block) {
                                    throw new Error(`No Block found for type ${blockType}`);
                                }

                                const newItem: OneOfBlockItem = {
                                    type: blockType,
                                    props: block.defaultValues(),
                                };

                                newState = {
                                    ...prevState,
                                    attachedBlocks: [...prevState.attachedBlocks, newItem],
                                    activeType: blockType,
                                };
                            }
                        }
                        // clean up the previous selected block
                        // when previous block has no values (values are equal to default values)
                        // then we remove the block
                        // this prevents from saving possibly invalid blocks for irrelevant (not selected) blocks
                        const previousSelectedBlock = getActiveBlock(prevState);
                        const newSelectedBlock = getActiveBlock(newState);

                        if (previousSelectedBlock.block && previousSelectedBlock.state && newSelectedBlock.type !== previousSelectedBlock.type) {
                            if (deepEqual(previousSelectedBlock.block.defaultValues(), previousSelectedBlock.state.props)) {
                                newState = {
                                    ...newState,
                                    attachedBlocks: newState.attachedBlocks.filter((c) => c.type !== previousSelectedBlock.state.type),
                                };
                            }
                        }

                        return newState;
                    });
                },
                [updateState],
            );

            const createUpdateSubBlocksFn = useCallback(
                (blockType: string) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const updateSubBlocksFn: Dispatch<SetStateAction<any>> = (setStateAction) => {
                        updateState((prevState) => ({
                            ...prevState,
                            attachedBlocks: prevState.attachedBlocks.map((c) =>
                                c.type === blockType ? { ...c, props: resolveNewState({ prevState: c.props, setStateAction }) } : c,
                            ),
                        }));
                    };
                    return updateSubBlocksFn;
                },
                [updateState],
            );

            const activeBlock = getActiveBlock(state);
            const selectedBlockType = activeBlock.block ? activeBlock.state.type : "none";
            const hasActiveBlock = Boolean(activeBlock.block);

            return (
                <SelectPreviewComponent>
                    <HiddenInSubroute>
                        <TypeChooser
                            data-variant={variant}
                            data-in-paper={isInPaper ? "" : undefined}
                            data-divider={(variant === "radio" || isInPaper) && hasActiveBlock ? "" : undefined}
                        >
                            <BlocksFinalForm<{ blockType: string }>
                                onSubmit={({ blockType }) => {
                                    handleBlockSelect(blockType);
                                }}
                                initialValues={{
                                    blockType: selectedBlockType,
                                }}
                            >
                                <BlockTypeField variant={variant} label={label} options={options} />
                            </BlocksFinalForm>
                        </TypeChooser>
                    </HiddenInSubroute>
                    {activeBlock.block && activeBlock.state ? (
                        <ActiveBlock data-padding={isInPaper && !activeBlock.block.definesOwnPadding ? "default" : "none"}>
                            <HoverPreviewComponent key={activeBlock.type} componentSlug={`#${activeBlock.type}`}>
                                <activeBlock.block.AdminComponent
                                    state={activeBlock.state.props}
                                    updateState={createUpdateSubBlocksFn(activeBlock.state.type)}
                                />
                            </HoverPreviewComponent>
                        </ActiveBlock>
                    ) : null}
                </SelectPreviewComponent>
            );
        },
        previewContent: (state, ctx) => {
            const { block, state: activeBlockState } = getActiveBlock(state);

            if (block && activeBlockState) {
                return block.previewContent(activeBlockState.props, ctx);
            } else {
                return [];
            }
        },

        dynamicDisplayName: (state) => {
            const { block, state: blockState } = getActiveBlock(state);

            if (block != null) {
                return block.dynamicDisplayName?.(blockState.props) ?? block.displayName;
            } else {
                return displayName;
            }
        },

        icon: (state) => {
            const { block, state: blockState } = getActiveBlock(state);

            if (block != null) {
                return block.icon?.(blockState.props);
            } else {
                return undefined;
            }
        },

        extractTextContents: (state, options) => {
            const includeInvisibleContent = options?.includeInvisibleContent ?? false;

            const content = state.attachedBlocks.reduce<string[]>((content, child) => {
                const block = blockForType(child.type);
                if (!block) {
                    throw new Error(`No Block found for type ${child.type}`); // for TS
                }

                if (child.type !== state.activeType && !includeInvisibleContent) {
                    return content;
                }

                return [...content, ...(block.extractTextContents?.(child.props, options) ?? [])];
            }, []);
            return content;
        },
        translateContent: async (state, translate) => {
            const translatedAttachedBlocks = await Promise.all(
                state.attachedBlocks.map(async (child) => {
                    const block = blockForType(child.type);
                    if (!block) {
                        throw new Error(`No Block found for type ${child.type}`);
                    }

                    const translatedProps = block.translateContent ? await block.translateContent(child.props, translate) : child.props;
                    return { ...child, props: translatedProps };
                }),
            );
            return { ...state, attachedBlocks: translatedAttachedBlocks };
        },
    };
    if (override) {
        return override(OneOfBlock);
    }
    return OneOfBlock;
};

interface BlockTypeFieldProps {
    variant: "select" | "radio" | "toggle";
    label: ReactNode;
    options: Array<{ value: string; label: ReactNode }>;
}

function BlockTypeField({ variant, label, options }: BlockTypeFieldProps) {
    const intl = useIntl();
    const labelText = messageText(intl, label) ?? intl.formatMessage({ id: "dextinity.blocks.oneOfBlock.blockType", defaultMessage: "Block type" });
    const optionsWithText = options.map((option) => ({ ...option, textValue: messageText(intl, option.label) }));

    if (variant === "radio") {
        return <RadioGroupField name="blockType" aria-label={labelText} options={optionsWithText} />;
    }

    if (variant === "toggle") {
        return (
            <StretchedSegmentedControl>
                <SegmentedControlField name="blockType" aria-label={labelText} options={optionsWithText} />
            </StretchedSegmentedControl>
        );
    }

    return <SelectField name="blockType" label={label} options={optionsWithText} required />;
}

const StretchedSegmentedControl = styled("div")`
    & > *,
    & [role="group"] {
        display: flex;
        inline-size: 100%;
    }

    & [aria-pressed] {
        flex: 1 1 auto;
    }
`;

const TypeChooser = styled("div")`
    &:not([data-in-paper]) {
        padding-block-end: var(--dextinity-space-4);
    }

    &[data-in-paper],
    &[data-variant="radio"] {
        padding: var(--dextinity-space-4);
    }

    &[data-divider] {
        border-block-end: var(--dextinity-line-width) solid var(--dextinity-color-line);
    }
`;

const ActiveBlock = styled("div")`
    &[data-padding="default"] {
        padding: var(--dextinity-space-4);
    }
`;
