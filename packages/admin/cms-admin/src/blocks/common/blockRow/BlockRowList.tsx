import { messages } from "@dextinity/admin";
import { BlockList, BlockListHeader, Icon, IconButton, type ToastData, ToastViewport } from "@dextinity/ui";
import type { PropsWithChildren } from "react";
import { useIntl } from "react-intl";

interface BlockRowListBulkActions {
    /** Shows the selected blocks. Without it, there is no such action, e.g. while a maximum of visible blocks applies. */
    onShow?: () => void;
    /** Hides the selected blocks. */
    onHide?: () => void;
    onCopy: () => void;
    /** Pastes the blocks from the clipboard at the top of the list. */
    onPaste: () => void;
    onDelete: () => void;
}

interface BlockRowListProps {
    /** The accessible name of the list, e.g. "Blocks". */
    "aria-label": string;
    /** The button at the end of the list, e.g. "Add block". */
    addLabel: string;
    count: number;
    selectedCount: number;
    onSelectAllChange: (selected: boolean) => void;
    onAdd: (index: number) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
    bulkActions: BlockRowListBulkActions;
    toasts: ToastData[];
    onDismissToast: (id: string) => void;
}

/**
 * The list of a blocks, list, or columns block: a `BlockList` with a header for the bulk actions, `BlockRow`s as children, and the
 * toasts of its actions.
 */
export function BlockRowList({
    "aria-label": ariaLabel,
    addLabel,
    count,
    selectedCount,
    onSelectAllChange,
    onAdd,
    onReorder,
    bulkActions,
    toasts,
    onDismissToast,
    children,
}: PropsWithChildren<BlockRowListProps>) {
    const intl = useIntl();
    const hasSelection = selectedCount > 0;

    return (
        <>
            <BlockList
                aria-label={ariaLabel}
                onAdd={onAdd}
                onReorder={onReorder}
                labels={{
                    add: addLabel,
                    insert: intl.formatMessage({ id: "dextinity.blocks.list.insert", defaultMessage: "Insert block here" }),
                }}
                header={
                    <BlockListHeader
                        count={count}
                        selectedCount={selectedCount}
                        onSelectAllChange={onSelectAllChange}
                        labels={{
                            selectAll: intl.formatMessage({ id: "dextinity.blocks.list.selectAll", defaultMessage: "Select all" }),
                            count: (count) =>
                                intl.formatMessage(
                                    {
                                        id: "dextinity.blocks.list.count",
                                        defaultMessage: "{count, plural, =0 {No blocks} one {# block} other {# blocks}}",
                                    },
                                    { count },
                                ),
                            selectedCount: (count) =>
                                intl.formatMessage({ id: "dextinity.blocks.list.selectedCount", defaultMessage: "{count} selected" }, { count }),
                        }}
                        actions={
                            <>
                                {bulkActions.onShow && (
                                    <IconButton
                                        variant="text"
                                        color="secondary"
                                        size="small"
                                        aria-label={intl.formatMessage({
                                            id: "dextinity.blocks.list.action.visible",
                                            defaultMessage: "Make visible",
                                        })}
                                        disabled={!hasSelection}
                                        onClick={bulkActions.onShow}
                                    >
                                        <Icon name="eye" />
                                    </IconButton>
                                )}
                                {bulkActions.onHide && (
                                    <IconButton
                                        variant="text"
                                        color="secondary"
                                        size="small"
                                        aria-label={intl.formatMessage({
                                            id: "dextinity.blocks.list.action.invisible",
                                            defaultMessage: "Make invisible",
                                        })}
                                        disabled={!hasSelection}
                                        onClick={bulkActions.onHide}
                                    >
                                        <Icon name="eye-off" />
                                    </IconButton>
                                )}
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    size="small"
                                    aria-label={intl.formatMessage(messages.copy)}
                                    disabled={!hasSelection}
                                    onClick={bulkActions.onCopy}
                                >
                                    <Icon name="copy" />
                                </IconButton>
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    size="small"
                                    aria-label={intl.formatMessage(messages.paste)}
                                    onClick={bulkActions.onPaste}
                                >
                                    <Icon name="paste-add" />
                                </IconButton>
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    size="small"
                                    aria-label={intl.formatMessage(messages.delete)}
                                    disabled={!hasSelection}
                                    onClick={bulkActions.onDelete}
                                >
                                    <Icon name="trash" />
                                </IconButton>
                            </>
                        }
                    />
                }
            >
                {children}
            </BlockList>
            <ToastViewport
                toasts={toasts}
                onDismiss={onDismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.blocks.list.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}
