import { UndoSnackbar, useSnackbarApi } from "@dextinity/admin";
import { type ChangeEvent, type Dispatch, type ReactNode, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { v4 as uuid } from "uuid";

import { CannotPasteBlockDialog } from "../../clipboard/CannotPasteBlockDialog";
import { type ClipboardContent, useBlockClipboard } from "../../clipboard/useBlockClipboard";
import type { BlockAdminComponentProps, BlockInterface, BlockState } from "../../types";
import { resolveNewState } from "../../utils";
import type { ListBlockAdditionalItemField, ListBlockState } from "../createListBlock";

interface CreateListBlockUseAdminComponentOptions<T extends BlockInterface> {
    block: T;
    maxVisibleBlocks?: number;
    additionalItemFields?: Record<string, ListBlockAdditionalItemField>;
}

type ListBlockUseAdminComponentProps<T extends BlockInterface> = BlockAdminComponentProps<ListBlockState<T>>;

interface ListBlockUseAdminComponentApi<T extends BlockInterface> {
    cannotPasteBlockErrorDialog: ReactNode;
    toggleVisible: (blockKey: string) => void;
    deleteBlocks: (blockKeys: string[]) => void;
    deleteAllSelectedBlocks: () => void;
    addNewBlock: (beforeIndex?: number | undefined) => string;
    createUpdateSubBlocksFn: (blockKey: string) => Dispatch<SetStateAction<BlockState<T>>>;
    totalVisibleBlocks: number;
    updateClipboardContent: (content: ClipboardContent) => Promise<void>;
    pasteBlock: (insertAt: number) => Promise<void>;
    handleToggleSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
    selectBlock: (currentBlock: ListBlockItem<T>, select: boolean) => void;
    copySelectedBlocks: () => void;
    selectedCount: number;
}

type ListBlockItem<T extends BlockInterface> = ListBlockState<T>["blocks"][0];
type RemovedListBlockItem<T extends BlockInterface> = ListBlockItem<T> & { removedAt: number };

export function createUseAdminComponent<T extends BlockInterface>({
    block,
    maxVisibleBlocks,
    additionalItemFields = {},
}: CreateListBlockUseAdminComponentOptions<T>): (props: ListBlockUseAdminComponentProps<T>) => ListBlockUseAdminComponentApi<T> {
    const useListBlockAdminComponent: (props: ListBlockUseAdminComponentProps<T>) => ListBlockUseAdminComponentApi<T> = ({ state, updateState }) => {
        const [cannotPasteBlockError, setCannotPasteBlockError] = useState<ReactNode>();

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

        const toggleVisible = useCallback(
            (blockKey: string) => {
                updateState((prevState) => ({
                    ...prevState,
                    blocks: prevState.blocks.map((c) => (c.key === blockKey ? { ...c, visible: !c.visible } : c)),
                }));
            },
            [updateState],
        );

        const snackbarApi = useSnackbarApi();
        const handleUndoClick = useCallback(
            (removedBlocks: RemovedListBlockItem<T>[] | undefined) => {
                if (!removedBlocks) {
                    return;
                }

                updateState((prevState) => {
                    const blocks = [...prevState.blocks];
                    removedBlocks?.forEach((removedBlock) => {
                        const { removedAt, ...block } = removedBlock;
                        blocks.splice(removedAt, 0, block);
                    });

                    return { ...prevState, blocks };
                });
            },
            [updateState],
        );

        const deleteBlocks = useCallback(
            (blockKeys: string[]) => {
                updateState((prevState) => {
                    const blocksToRemove = prevState.blocks
                        .map((block, index) => {
                            return { ...block, removedAt: index };
                        })
                        .filter((block) => {
                            return blockKeys.includes(block.key);
                        });

                    snackbarApi.showSnackbar(
                        <UndoSnackbar
                            message={
                                <FormattedMessage
                                    id="dextinity.blocks.list.blockDeleted"
                                    defaultMessage="{count, plural, one {block} other {# blocks}} deleted"
                                    values={{ count: blocksToRemove.length }}
                                />
                            }
                            payload={blocksToRemove}
                            onUndoClick={(blocksToRemove) => {
                                handleUndoClick(blocksToRemove);
                            }}
                        />,
                    );

                    return { ...prevState, blocks: prevState.blocks.filter((c) => !blockKeys.includes(c.key)) };
                });
            },
            [handleUndoClick, snackbarApi, updateState],
        );

        const deleteAllSelectedBlocks = () => {
            const blocksToDelete = state.blocks.filter((c) => {
                return c.selected;
            });

            deleteBlocks(
                blocksToDelete.map((block) => {
                    return block.key;
                }),
            );
        };

        const addNewBlock = (beforeIndex?: number) => {
            const key = uuid();

            const newBlock = {
                key,
                visible: maxVisibleBlocks ? totalVisibleBlocks < maxVisibleBlocks : true,
                props: block.defaultValues(),
                selected: false,
                slideIn: false,
                ...Object.entries(additionalItemFields).reduce((fields, [field, { defaultValue }]) => ({ ...fields, [field]: defaultValue }), {}),
            };

            const newBlocks = [...state.blocks];

            if (beforeIndex !== undefined) {
                newBlocks.splice(beforeIndex, 0, newBlock);
            } else {
                newBlocks.push(newBlock);
            }

            updateState((prevState) => ({
                ...prevState,
                blocks: newBlocks,
            }));

            return key;
        };

        const createUpdateSubBlocksFn = useCallback(
            (blockKey: string) => {
                const updateSubBlocksFn: Dispatch<SetStateAction<BlockState<T>>> = (setStateAction) => {
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

        const totalVisibleBlocks = state.blocks.filter((block) => block.visible).length;

        const { updateClipboardContent, getClipboardContent } = useBlockClipboard({ supports: block });

        const cannotPasteBlockErrorDialog = useMemo(
            () =>
                cannotPasteBlockError !== undefined && (
                    <CannotPasteBlockDialog open onClose={() => setCannotPasteBlockError(undefined)} error={cannotPasteBlockError} />
                ),
            [cannotPasteBlockError],
        );
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

                const newBlocks: ListBlockItem<T>[] = content.map((block) => {
                    return {
                        key: uuid(),
                        visible: canAddVisibleBlock ? block.visible : false,
                        props: block.state,
                        selected: false,
                        slideIn: true,
                        ...block.additionalFields,
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

        const handleToggleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
            const selected = event.target.checked;

            updateState((prevState) => {
                return {
                    ...prevState,
                    blocks: prevState.blocks.map((block) => {
                        return { ...block, selected };
                    }),
                };
            });
        };

        const selectBlock = (currentBlock: ListBlockItem<BlockInterface>, select: boolean) => {
            updateState((prevState) => {
                return {
                    ...prevState,
                    blocks: prevState.blocks.map((block) => {
                        return { ...block, selected: block === currentBlock ? select : block.selected };
                    }),
                };
            });
        };

        const copySelectedBlocks = () => {
            const blocksToCopy = state.blocks
                .filter((block) => block.selected)
                .map((item) => ({
                    name: block.name,
                    visible: item.visible,
                    state: item.props,
                    additionalFields: Object.keys(additionalItemFields).reduce((fields, field) => ({ ...fields, [field]: item[field] }), {}),
                }));

            updateClipboardContent(blocksToCopy);
        };

        const selectedCount = state.blocks.filter((block) => block.selected).length;

        return {
            cannotPasteBlockErrorDialog,
            toggleVisible,
            deleteBlocks,
            deleteAllSelectedBlocks,
            addNewBlock,
            createUpdateSubBlocksFn,
            totalVisibleBlocks,
            updateClipboardContent,
            pasteBlock,
            handleToggleSelectAll,
            selectBlock,
            copySelectedBlocks,
            selectedCount,
        };
    };

    return useListBlockAdminComponent;
}
