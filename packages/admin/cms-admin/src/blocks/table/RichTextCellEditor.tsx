import { Popover } from "@base-ui/react/popover";
import { Button, type DataGridEditorRenderParams, useThemePortalContainer } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type KeyboardEvent, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { stickyTopVariable } from "../common/stickyTopVariable";
import type { TableBlockRowState } from "../createTableBlock";
import { resolveNewState } from "../utils";
import { useTableBlockContext } from "./TableBlockContext";

/**
 * The rich text editor of a table cell, in a panel at the cell. Unlike the grid's own editors, Escape and a click outside keep the
 * changes, since a rich text is too much work to lose with one key, and Enter adds a paragraph. Ctrl/Cmd+Enter saves.
 */
export function RichTextCellEditor({ value, label, onChange, onCommit }: DataGridEditorRenderParams<TableBlockRowState>) {
    const { RichTextBlock } = useTableBlockContext();
    const { anchor, anchorRef, container } = useThemePortalContainer<HTMLSpanElement>();
    const [popup, setPopup] = useState<HTMLDivElement | null>(null);
    const [content, setContent] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!content) {
            return;
        }

        // Wait for TipTap to render its content, like TipTap's own focus command does:
        // https://github.com/ueberdosis/tiptap/blob/626b052fa2098c8d5b20abb2e60fa6d7711d46af/packages/core/src/commands/focus.ts#L59-L61
        const animationFrame = requestAnimationFrame(() => focusEditorAtEnd(content));
        return () => cancelAnimationFrame(animationFrame);
    }, [content]);

    const isInsideEditor = (target: EventTarget | null | undefined) => target instanceof Node && popup?.contains(target) === true;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        // Keys in dialogs of the editor, e.g. the link dialog, belong to these dialogs
        if (!isInsideEditor(event.target)) {
            event.stopPropagation();
            return;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onCommit();
        } else if (event.key === "Enter" && !(event.metaKey || event.ctrlKey)) {
            event.stopPropagation();
        }
    };

    // Before the rich text editor, which would add a line break. The grid doesn't get the key: the panel isn't inside the grid's cell.
    const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && isInsideEditor(event.target)) {
            event.preventDefault();
            event.stopPropagation();
            onCommit();
        }
    };

    return (
        <>
            <EditorAnchor ref={anchorRef} />
            <Popover.Root
                open={anchor != null}
                onOpenChange={(open, eventDetails) => {
                    if (open) {
                        return;
                    }
                    const target = eventDetails.event?.target;
                    const isInEditorLayer = target instanceof Element && anchor != null && isInLayerAbove(target, anchor);
                    if ((eventDetails.reason === "outside-press" || eventDetails.reason === "escape-key") && isInEditorLayer) {
                        eventDetails.cancel();
                        return;
                    }
                    onCommit();
                }}
            >
                <Popover.Portal container={container}>
                    <EditorPositioner anchor={anchor?.closest("td") ?? anchor} side="bottom" align="start" sideOffset={4} collisionPadding={16}>
                        <EditorPopup
                            ref={setPopup}
                            aria-label={label}
                            initialFocus={false}
                            finalFocus={false}
                            onKeyDown={handleKeyDown}
                            onKeyDownCapture={handleKeyDownCapture}
                        >
                            <EditorContent ref={setContent}>
                                <RichTextBlock.AdminComponent
                                    state={value}
                                    updateState={(setStateAction) => onChange(resolveNewState({ prevState: value, setStateAction }))}
                                />
                            </EditorContent>
                            <EditorActions>
                                <Button size="small" onClick={() => onCommit()}>
                                    <FormattedMessage id="dextinity.tableBlock.cellEditor.done" defaultMessage="Done" />
                                </Button>
                            </EditorActions>
                        </EditorPopup>
                    </EditorPositioner>
                </Popover.Portal>
            </Popover.Root>
        </>
    );
}

const layerSelector = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [role="presentation"]';

// Dialogs, menus and popovers of the rich text editor render outside the panel, above the table; using them doesn't end editing
function isInLayerAbove(element: Element, anchor: Element) {
    const layer = element.closest(layerSelector);
    return layer != null && !layer.contains(anchor);
}

function focusEditorAtEnd(content: HTMLElement) {
    const editable = content.querySelector<HTMLElement>('[contenteditable="true"]');
    if (!editable) {
        return;
    }

    editable.focus();
    window.getSelection()?.collapse(editable, editable.childNodes.length);
    content.scrollTop = content.scrollHeight;
}

const EditorAnchor = styled("span")`
    display: block;
`;

const EditorPositioner = styled(Popover.Positioner)`
    z-index: 1000;
    outline: none;
`;

const EditorPopup = styled(Popover.Popup)`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-2);
    box-sizing: border-box;
    inline-size: min(460px, var(--available-width));
    max-block-size: min(60vh, var(--available-height));
    padding: var(--dextinity-space-2);
    border-radius: var(--dextinity-popover-radius);
    background: var(--dextinity-color-surface-raised);
    box-shadow: var(--dextinity-popover-shadow);
    color: var(--dextinity-popover-foreground);
    outline: none;
`;

// The editor's sticky toolbar sticks to the top of the panel, not below the page's breadcrumbs
const EditorContent = styled("div")`
    ${stickyTopVariable}: 0px;

    min-block-size: 0;
    overflow-y: auto;
`;

const EditorActions = styled("div")`
    display: flex;
    justify-content: flex-end;
`;
