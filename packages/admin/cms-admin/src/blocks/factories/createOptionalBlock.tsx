import { Box, Divider } from "@mui/material";
import isEqual from "lodash.isequal";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { MessageDescriptor } from "react-intl";
import { Route, useRouteMatch } from "react-router";

import { BlockAdminComponentPaper } from "../common/BlockAdminComponentPaper";
import { Collapsible } from "../common/Collapsible";
import { CollapsibleSwitchButtonHeader } from "../common/CollapsibleSwitchButtonHeader";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import type { BlockInputApi, BlockInterface, BlockOutputApi, BlockState } from "../types";
import { resolveNewState } from "../utils";

// @TODO: move to general types
// type BlockDecorator = <T extends BlockInterface>(block: T) => BlockInterface;

export interface OptionalBlockState<DecoratedBlock extends BlockInterface> {
    block?: BlockState<DecoratedBlock>;
    visible: boolean;
}

export interface OptionalBlockDecoratorFragment<DecoratedBlock extends BlockInterface> {
    block?: BlockInputApi<DecoratedBlock>;
    visible: boolean;
}

export interface OptionalBlockOutput<DecoratedBlock extends BlockInterface> {
    block?: BlockOutputApi<DecoratedBlock>;
    visible: boolean;
}

export function createOptionalBlock<T extends BlockInterface>(
    decoratedBlock: T,
    options?: { title?: ReactNode; name?: string; tags?: Array<MessageDescriptor | string> },
    override?: (
        block: BlockInterface<OptionalBlockDecoratorFragment<T>, OptionalBlockState<T>, OptionalBlockOutput<T>>,
    ) => BlockInterface<OptionalBlockDecoratorFragment<T>, OptionalBlockState<T>, OptionalBlockOutput<T>>,
): BlockInterface<OptionalBlockDecoratorFragment<T>, OptionalBlockState<T>, OptionalBlockOutput<T>> {
    const OptionalBlock: BlockInterface<OptionalBlockDecoratorFragment<T>, OptionalBlockState<T>, OptionalBlockOutput<T>> = {
        ...createBlockSkeleton(),

        name: options?.name ?? `Optional${decoratedBlock.name}`,

        displayName: decoratedBlock.displayName,

        tags: decoratedBlock.tags,

        defaultValues: () => ({ block: undefined, visible: false }),

        input2State: (input) => {
            return {
                ...input,
                block: input.block ? decoratedBlock.input2State(input.block) : undefined,
            };
        },
        state2Output: (s) => {
            return {
                ...s,
                block: s.block ? decoratedBlock.state2Output(s.block) : undefined,
            };
        },

        output2State: async (output, context) => ({
            ...output,
            block: output.block ? await decoratedBlock.output2State(output.block, context) : undefined,
        }),

        createPreviewState: (state, previewCtx) => {
            return {
                ...state,
                block: state.block ? decoratedBlock.createPreviewState(state.block, previewCtx) : undefined,
                adminMeta: { route: previewCtx.parentUrl },
            };
        },
        isValid: async (state) => !state.block || decoratedBlock.isValid(state.block),

        anchors: (state) => {
            if (state.block === undefined) {
                return [];
            }

            return decoratedBlock.anchors?.(state.block) ?? [];
        },

        dependencies: (state) => {
            if (state.block === undefined) {
                return [];
            }

            return decoratedBlock.dependencies?.(state.block) ?? [];
        },

        replaceDependenciesInOutput: (output, replacements) => {
            return {
                ...output,
                block: output.block ? decoratedBlock.replaceDependenciesInOutput(output.block, replacements) : undefined,
            };
        },

        definesOwnTitle: true,

        AdminComponent: ({ state, updateState }) => {
            const match = useRouteMatch();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateSubBlocksFn: Dispatch<SetStateAction<any>> = (setStateAction) => {
                updateState((prevState) => ({
                    ...prevState,
                    block: resolveNewState({ prevState: prevState.block ? prevState.block : decoratedBlock.defaultValues(), setStateAction }),
                }));
            };

            return (
                <Route path={match.url}>
                    {({ match }) =>
                        match?.isExact ? (
                            <BlockAdminComponentPaper disablePadding>
                                <Collapsible
                                    open={state.visible}
                                    header={<CollapsibleSwitchButtonHeader checked={state.visible} title={options?.title} />}
                                    onChange={(open) => {
                                        updateState((prevState) => {
                                            if (open) {
                                                // we need the default state of the decorated block now
                                                if (!prevState.block) {
                                                    return {
                                                        ...prevState,
                                                        block: decoratedBlock.defaultValues(),
                                                        visible: open,
                                                    };
                                                } else {
                                                    return {
                                                        ...prevState,
                                                        visible: open,
                                                    };
                                                }
                                            } else {
                                                // decorated block is turned off, clean up the state of decorated block
                                                // we do not save the default state
                                                if (isEqual(decoratedBlock.defaultValues(), prevState.block)) {
                                                    return {
                                                        ...prevState,
                                                        block: undefined,
                                                        visible: open,
                                                    };
                                                } else {
                                                    return {
                                                        ...prevState,
                                                        visible: open,
                                                    };
                                                }
                                            }
                                        });
                                    }}
                                >
                                    <Divider />
                                    <Box padding={decoratedBlock.definesOwnPadding ? 0 : 3}>
                                        <decoratedBlock.AdminComponent
                                            updateState={updateSubBlocksFn}
                                            state={state.block ? state.block : decoratedBlock.defaultValues()}
                                        />
                                    </Box>
                                </Collapsible>
                            </BlockAdminComponentPaper>
                        ) : (
                            <decoratedBlock.AdminComponent
                                updateState={updateSubBlocksFn}
                                state={state.block ? state.block : decoratedBlock.defaultValues()}
                            />
                        )
                    }
                </Route>
            );
        },
        previewContent: ({ block, visible }, ctx) => {
            return block && visible ? decoratedBlock.previewContent(block, ctx) : [];
        },

        extractTextContents: (state, options) => {
            const includeInvisibleContent = options?.includeInvisibleContent ?? false;

            if (state.block === undefined) {
                return [];
            }

            if (state.visible || includeInvisibleContent) {
                return decoratedBlock.extractTextContents?.(state.block, options) ?? [];
            }

            return [];
        },
        translateContent: async (state, translate) => {
            if (state.block === undefined) {
                return state;
            }

            const translatedBlock = decoratedBlock.translateContent ? await decoratedBlock.translateContent(state.block, translate) : state.block;
            return { ...state, block: translatedBlock };
        },
    };

    if (override) {
        return override(OptionalBlock);
    }

    return OptionalBlock;
}
