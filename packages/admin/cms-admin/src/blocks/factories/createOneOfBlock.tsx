import { Field, RadioGroupField, SelectField } from "@dextinity/admin";
import { Box, Divider, ToggleButton as MuiToggleButton, ToggleButtonGroup as MuiToggleButtonGroup } from "@mui/material";
import { styled } from "@mui/material/styles";
import isEqual from "lodash.isequal";
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useMemo } from "react";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

import { useContentScope } from "../../contentScope/Provider";
import { useBlockAdminComponentPaper } from "../common/BlockAdminComponentPaper";
import { HiddenInSubroute } from "../common/HiddenInSubroute";
import { useBlocksConfig } from "../config/BlocksConfigContext";
import { BlocksFinalForm } from "../form/BlocksFinalForm";
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
            let message = `Can't find reference to active block of type "${s.activeType}".`;

            if (process.env.NODE_ENV === "development") {
                message += ` This is probably due to a missing "x-include-invisible-content" HTTP header. Please make sure to include the header when fetching the block.`;
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
                            if (isEqual(previousSelectedBlock.block.defaultValues(), previousSelectedBlock.state.props)) {
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

            return (
                <SelectPreviewComponent>
                    <HiddenInSubroute>
                        <Box paddingBottom={isInPaper ? 0 : 3}>
                            <BlocksFinalForm<{ blockType: string }>
                                onSubmit={({ blockType }) => {
                                    handleBlockSelect(blockType);
                                }}
                                initialValues={{
                                    blockType: selectedBlockType,
                                }}
                            >
                                {variant === "select" && (
                                    <>
                                        <Box padding={isInPaper ? 3 : 0}>
                                            <SelectField name="blockType" options={options} fullWidth required />
                                        </Box>
                                        {isInPaper && activeBlock.block && <Divider />}
                                    </>
                                )}
                                {variant === "radio" && (
                                    <>
                                        <Box display="flex" flexDirection="column" padding={3}>
                                            <RadioGroupField name="blockType" fullWidth options={options} />
                                        </Box>
                                        {activeBlock.block && <Divider />}
                                    </>
                                )}
                                {variant === "toggle" && (
                                    <>
                                        <Box padding={isInPaper ? 3 : 0}>
                                            <Field name="blockType" fullWidth>
                                                {({ input: { value, onChange } }) => (
                                                    <ToggleButtonGroup
                                                        value={value}
                                                        onChange={(event, blockType: string | null) => {
                                                            if (blockType) {
                                                                onChange(blockType);
                                                            }
                                                        }}
                                                        exclusive
                                                    >
                                                        {options.map((option) => (
                                                            <ToggleButton value={option.value} key={option.value}>
                                                                {option.label}
                                                            </ToggleButton>
                                                        ))}
                                                    </ToggleButtonGroup>
                                                )}
                                            </Field>
                                        </Box>
                                        {isInPaper && activeBlock.block && <Divider />}
                                    </>
                                )}
                            </BlocksFinalForm>
                        </Box>
                    </HiddenInSubroute>
                    {activeBlock.block && activeBlock.state ? (
                        <Box padding={isInPaper && !activeBlock.block.definesOwnPadding ? 3 : 0}>
                            <HoverPreviewComponent key={activeBlock.type} componentSlug={`#${activeBlock.type}`}>
                                <activeBlock.block.AdminComponent
                                    state={activeBlock.state.props}
                                    updateState={createUpdateSubBlocksFn(activeBlock.state.type)}
                                />
                            </HoverPreviewComponent>
                        </Box>
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

const ToggleButtonGroup = styled(MuiToggleButtonGroup)`
    display: flex;
`;

const ToggleButton = styled(MuiToggleButton)`
    flex: 1;
    color: ${({ theme }) => theme.palette.text.primary};
`;
