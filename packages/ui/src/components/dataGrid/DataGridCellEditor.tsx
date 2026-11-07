import { Popover as BasePopover } from "@base-ui/react/popover";
import { Select as BaseSelect } from "@base-ui/react/select";
import { type KeyboardEvent, type ReactNode, useLayoutEffect, useRef } from "react";

import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Icon } from "../icon/Icon";
import type { DataGridEditor, DataGridEditorOption } from "./DataGrid";
import styles from "./DataGrid.module.scss";

interface DataGridCellEditorProps<Row> {
    editor: DataGridEditor<Row>;
    row: Row;
    draft: unknown;
    error: string | undefined;
    errorId: string | undefined;
    label: string;
    onDraftChange: (draft: unknown) => void;
    onCommit: (value: unknown) => void;
    onLeave: (value: unknown) => void;
    onCancel: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

function optionKey(value: DataGridEditorOption["value"]): string {
    return `${typeof value}:${String(value)}`;
}

function TextEditor({
    draft,
    label,
    errorId,
    numeric,
    onDraftChange,
    onLeave,
    onKeyDown,
}: {
    draft: string;
    label: string;
    errorId: string | undefined;
    numeric: boolean;
    onDraftChange: (draft: string) => void;
    onLeave: (value: string) => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        const input = inputRef.current;
        if (input != null) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }, []);

    return (
        <input
            ref={inputRef}
            className={styles.editorInput}
            aria-label={label}
            aria-invalid={errorId != null ? true : undefined}
            aria-describedby={errorId}
            inputMode={numeric ? "decimal" : undefined}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={(event) => onLeave(event.target.value)}
        />
    );
}

function SelectEditor({
    options,
    draft,
    label,
    onCommit,
    onCancel,
    onKeyDown,
}: {
    options: DataGridEditorOption[];
    draft: unknown;
    label: string;
    onCommit: (value: unknown) => void;
    onCancel: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
    const { anchor, anchorRef, container } = useThemePortalContainer<HTMLButtonElement>();
    const optionsByKey = new Map(options.map((option) => [optionKey(option.value), option]));
    const selected = options.find((option) => option.value === draft);

    return (
        <BaseSelect.Root
            open
            value={selected != null ? optionKey(selected.value) : null}
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
            onValueChange={(key: string | null) => {
                const option = key != null ? optionsByKey.get(key) : undefined;
                onCommit(option?.value ?? null);
            }}
        >
            <BaseSelect.Trigger ref={anchorRef} className={styles.editorSelect} aria-label={label}>
                <span className={styles.editorSelectValue}>{selected?.label}</span>
                <Icon name="chevron-down" />
            </BaseSelect.Trigger>
            <BaseSelect.Portal container={container}>
                <BaseSelect.Positioner
                    className={styles.editorPositioner}
                    anchor={anchor?.closest("td") ?? anchor}
                    sideOffset={4}
                    align="start"
                    alignItemWithTrigger={false}
                >
                    <BaseSelect.Popup
                        className={styles.editorPopup}
                        // The grid moves the focus itself after the select closes, e.g. into the next cell's editor on Tab
                        finalFocus={false}
                        onKeyDown={(event) => {
                            // The select handles Enter and Escape itself; Tab moves on like in the other editors
                            if (event.key === "Tab") {
                                onKeyDown(event);
                            }
                        }}
                    >
                        <BaseSelect.List className={styles.editorList}>
                            {options.map((option) => (
                                <BaseSelect.Item
                                    key={optionKey(option.value)}
                                    value={optionKey(option.value)}
                                    label={option.label}
                                    className={styles.editorItem}
                                >
                                    <span className={styles.editorItemText}>{option.label}</span>
                                    <BaseSelect.ItemIndicator className={styles.editorItemIndicator}>
                                        <Icon name="check" />
                                    </BaseSelect.ItemIndicator>
                                </BaseSelect.Item>
                            ))}
                        </BaseSelect.List>
                    </BaseSelect.Popup>
                </BaseSelect.Positioner>
            </BaseSelect.Portal>
        </BaseSelect.Root>
    );
}

/**
 * The editor of a cell in edit mode. Internal to `DataGrid`, which owns the draft and the keyboard model.
 */
export function DataGridCellEditor<Row>({
    editor,
    row,
    draft,
    error,
    errorId,
    label,
    onDraftChange,
    onCommit,
    onLeave,
    onCancel,
    onKeyDown,
}: DataGridCellEditorProps<Row>): ReactNode {
    switch (editor.type) {
        case "select":
            return <SelectEditor options={editor.options} draft={draft} label={label} onCommit={onLeave} onCancel={onCancel} onKeyDown={onKeyDown} />;
        case "custom":
            return (
                <div className={styles.editorCustom} onKeyDown={onKeyDown}>
                    {editor.render({ row, value: draft, label, error, onChange: onDraftChange, onCommit, onCancel })}
                </div>
            );
        case "checkbox":
            return null;
        default:
            return (
                <TextEditor
                    draft={draft == null ? "" : String(draft)}
                    label={label}
                    errorId={errorId}
                    numeric={editor.type === "number"}
                    onDraftChange={onDraftChange}
                    onLeave={onLeave}
                    onKeyDown={onKeyDown}
                />
            );
    }
}

/**
 * Why the edited value can't be saved, shown below the cell. Internal to `DataGrid`.
 */
export function DataGridEditorError({ id, children }: { id: string; children: ReactNode }): ReactNode {
    const { anchor, anchorRef, container } = useThemePortalContainer<HTMLSpanElement>();

    return (
        <>
            <span ref={anchorRef} hidden />
            <BasePopover.Root open modal={false}>
                <BasePopover.Portal container={container}>
                    <BasePopover.Positioner
                        className={styles.editorErrorPositioner}
                        anchor={anchor?.closest("td") ?? null}
                        side="bottom"
                        align="start"
                        sideOffset={4}
                        collisionPadding={8}
                    >
                        <BasePopover.Popup className={styles.editorError} role="none" initialFocus={false} finalFocus={false}>
                            <span id={id}>{children}</span>
                        </BasePopover.Popup>
                    </BasePopover.Positioner>
                </BasePopover.Portal>
            </BasePopover.Root>
        </>
    );
}
