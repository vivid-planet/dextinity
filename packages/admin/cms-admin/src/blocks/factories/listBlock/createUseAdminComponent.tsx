import type { ToastData } from "@dextinity/ui";
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { CannotPasteBlockDialog } from "../../clipboard/CannotPasteBlockDialog";
import { type ClipboardContent, useBlockClipboard } from "../../clipboard/useBlockClipboard";
import { useBlockListToasts } from "../../common/blockRow/useBlockListToasts";
import { useBlockContext } from "../../context/useBlockContext";
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
    clipboardProgressDialog: ReactNode;
    toasts: ToastData[];
    dismissToast: (id: string) => void;
    toggleVisible: (blockKey: string) => void;
    setVisibleOfSelectedBlocks: (visible: boolean) => void;
    deleteBlocks: (blockKeys: string[]) => void;
    deleteAllSelectedBlocks: () => void;
    addNewBlock: (beforeIndex?: number | undefined) => string;
    moveBlock: (fromIndex: number, toIndex: number) => void;
    duplicateBlock: (blockKey: string) => Promise<void>;
    createUpdateSubBlocksFn: (blockKey: string) => Dispatch<SetStateAction<BlockState<T>>>;
    totalVisibleBlocks: number;
    updateClipboardContent: (content: ClipboardContent) => Promise<void>;
    copyBlock: (blockKey: string) => void;
    pasteBlock: (insertAt: number) => Promise<void>;
    selectAllBlocks: (selected: boolean) => void;
    selectBlock: (blockKey: string, select: boolean) => void;
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
    const additionalFieldsOf = (item: ListBlockItem<T>) =>
        Object.keys(additionalItemFields).reduce((fields, field) => ({ ...fields, [field]: item[field] }), {});

    const useListBlockAdminComponent: (props: ListBlockUseAdminComponentProps<T>) => ListBlockUseAdminComponentApi<T> = ({ state, updateState }) => {
        const intl = useIntl();
        const context = useBlockContext();
        const [cannotPasteBlockError, setCannotPasteBlockError] = useState<ReactNode>();
        const { toasts, dismissToast, perform } = useBlockListToasts();

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

        const setVisibleOfSelectedBlocks = (visible: boolean) => {
            updateState((prevState) => ({
                ...prevState,
                blocks: prevState.blocks.map((c) => (c.selected ? { ...c, visible } : c)),
            }));
        };

        const restoreBlocks = useCallback(
            (removedBlocks: RemovedListBlockItem<T>[]) => {
                updateState((prevState) => {
                    const blocks = [...prevState.blocks];
                    for (const removedBlock of removedBlocks) {
                        const { removedAt, ...block } = removedBlock;
                        blocks.splice(removedAt, 0, { ...block, selected: false });
                    }

                    return { ...prevState, blocks };
                });
            },
            [updateState],
        );

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

        const deleteAllSelectedBlocks = () => {
            deleteBlocks(state.blocks.filter((block) => block.selected).map((block) => block.key));
        };

        const totalVisibleBlocks = state.blocks.filter((block) => block.visible).length;

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

            updateState((prevState) => {
                const blocks = [...prevState.blocks];
                blocks.splice(beforeIndex ?? blocks.length, 0, newBlock);
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
            if (!original) {
                return;
            }

            const props = await block.output2State(block.state2Output(original.props), context);
            const canBeVisible = maxVisibleBlocks ? totalVisibleBlocks < maxVisibleBlocks : true;

            updateState((prevState) => {
                const index = prevState.blocks.findIndex((item) => item.key === blockKey);
                const blocks = [...prevState.blocks];
                blocks.splice(index + 1, 0, {
                    ...original,
                    key: uuid(),
                    props,
                    visible: original.visible && canBeVisible,
                    selected: false,
                    slideIn: true,
                });
                return { ...prevState, blocks };
            });
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

        const { updateClipboardContent, getClipboardContent, progressDialog: clipboardProgressDialog } = useBlockClipboard({ supports: block });

        const cannotPasteBlockErrorDialog = useMemo(
            () =>
                cannotPasteBlockError !== undefined && (
                    <CannotPasteBlockDialog open onClose={() => setCannotPasteBlockError(undefined)} error={cannotPasteBlockError} />
                ),
            [cannotPasteBlockError],
        );

        const copyBlocks = (items: ListBlockItem<T>[]) => {
            updateClipboardContent(
                items.map((item) => ({
                    name: block.name,
                    visible: item.visible,
                    state: item.props,
                    additionalFields: additionalFieldsOf(item),
                })),
            );
        };

        const copyBlock = (blockKey: string) => {
            copyBlocks(state.blocks.filter((item) => item.key === blockKey));
        };

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

        const selectAllBlocks = (selected: boolean) => {
            updateState((prevState) => ({
                ...prevState,
                blocks: prevState.blocks.map((block) => ({ ...block, selected })),
            }));
        };

        const selectBlock = (blockKey: string, select: boolean) => {
            updateState((prevState) => ({
                ...prevState,
                blocks: prevState.blocks.map((block) => (block.key === blockKey ? { ...block, selected: select } : block)),
            }));
        };

        const copySelectedBlocks = () => {
            copyBlocks(state.blocks.filter((block) => block.selected));
        };

        const selectedCount = state.blocks.filter((block) => block.selected).length;

        return {
            cannotPasteBlockErrorDialog,
            clipboardProgressDialog,
            toasts,
            dismissToast,
            toggleVisible,
            setVisibleOfSelectedBlocks,
            deleteBlocks,
            deleteAllSelectedBlocks,
            addNewBlock,
            moveBlock,
            duplicateBlock,
            createUpdateSubBlocksFn,
            totalVisibleBlocks,
            updateClipboardContent,
            copyBlock,
            pasteBlock,
            selectAllBlocks,
            selectBlock,
            copySelectedBlocks,
            selectedCount,
        };
    };

    return useListBlockAdminComponent;
}
