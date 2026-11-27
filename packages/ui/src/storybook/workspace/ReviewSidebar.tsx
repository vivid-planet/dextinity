import { type KeyboardEvent, type ReactNode, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Button } from "../../components/button/Button";
import { ConfirmDialog } from "../../components/confirmDialog/ConfirmDialog";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Switch } from "../../components/switch/Switch";
import { Textarea } from "../../components/textarea/Textarea";
import { ToastViewport } from "../../components/toast/ToastViewport";
import { useToasts } from "../../components/toast/useToasts";
import {
    type DescribeNotePlace,
    filterByScope,
    filterNotes,
    formatNoteComment,
    formatNotesMarkdown,
    formatNoteTime,
    formatViewSettings,
    getNoteNumber,
    groupByPage,
    type NoteScope,
    type NoteStatusFilter,
    type PrototypePage,
} from "./designerNotes";
import styles from "./ReviewSidebar.module.scss";
import { formatCodeRequest, formatTextChanges, getCodeRequestChanges } from "./textChanges";
import { type ClaudeAvailability, findWorkbenchCommentsHost } from "./workbenchHost";
import { type DesignerNote, designerNoteList, isNoteDone, type NoteShareTarget, type TextChange, textChangeList } from "./workspaceNotes";

async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function CopyButton({ getText, label, disabled = false }: { getText: () => string; label: string; disabled?: boolean }) {
    const [copied, setCopied] = useState(false);
    return (
        <Button
            variant="outlined"
            color="secondary"
            size="small"
            disabled={disabled}
            startIcon={<Icon name={copied ? "check-circle" : "copy"} />}
            onClick={async () => {
                setCopied(await copyText(getText()));
                window.setTimeout(() => setCopied(false), 1500);
            }}
        >
            {copied ? "Copied" : label}
        </Button>
    );
}

const scopeOptions: Array<{ value: NoteScope; label: string }> = [
    { value: "page", label: "This page" },
    { value: "all", label: "All pages" },
];

const statusOptions: Array<{ value: NoteStatusFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "done", label: "Done" },
];

/**
 * A panel at the end of the Workbench's body that lists what a review tool collected. It stays open next to the frame, which gets
 * narrower; where that would leave the frame too little room, it covers the frame instead, see `getReviewSidebarLayout`. Escape
 * inside it closes it.
 */
function WorkbenchSidebar({
    title,
    count,
    overlay,
    onClose,
    filters,
    footer,
    storageNote,
    children,
}: {
    title: string;
    count: ReactNode;
    overlay: boolean;
    onClose: () => void;
    filters: ReactNode;
    footer: ReactNode;
    /** Where the items are kept, so a designer doesn't count on others seeing them. */
    storageNote: string;
    children: ReactNode;
}) {
    const titleId = useId();
    function handleKeyDown(event: KeyboardEvent) {
        // React also passes on the keys of a dialog the sidebar opened in a portal, which close the dialog only
        if (event.key === "Escape" && !event.defaultPrevented && event.currentTarget.contains(event.target as Node)) {
            event.preventDefault();
            onClose();
        }
    }
    return (
        <aside className={styles.root} aria-labelledby={titleId} data-overlay={overlay || undefined} onKeyDown={handleKeyDown}>
            <div className={styles.header}>
                <h2 id={titleId} className={styles.title}>
                    {title}
                </h2>
                <span className={styles.count}>{count}</span>
                <IconButton variant="text" color="secondary" size="small" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>
                    <Icon name="close" />
                </IconButton>
            </div>
            <div className={styles.filters}>{filters}</div>
            <div className={styles.body}>{children}</div>
            <div className={styles.footer}>
                {footer}
                <p className={styles.storageNote}>
                    <Icon name="info" />
                    {storageNote}
                </p>
            </div>
        </aside>
    );
}

/**
 * An item of a sidebar's list: its text shows the item's element in the frame, and a long text shows its first lines until the
 * designer shows more of it. The children are the item's actions.
 */
function SidebarEntry({
    text,
    number,
    details,
    shown,
    done = false,
    onShow,
    children,
}: {
    text: ReactNode;
    number?: number;
    details: ReactNode;
    shown: boolean;
    done?: boolean;
    onShow: () => void;
    children: ReactNode;
}) {
    const textRef = useRef<HTMLSpanElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [clipped, setClipped] = useState(false);
    const textId = useId();

    // An expanded text keeps its toggle, since it can't tell whether its first lines would cut it off
    function measure() {
        const element = textRef.current;
        if (element && !expanded) {
            setClipped(element.scrollHeight > element.clientHeight);
        }
    }
    useLayoutEffect(measure);
    useEffect(() => {
        const element = textRef.current;
        if (!element) {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    });

    return (
        <li className={styles.entry} data-done={done || undefined} data-shown={shown || undefined}>
            <button type="button" className={styles.entryMain} onClick={onShow}>
                {number !== undefined && <span className={styles.number}>{number}</span>}
                <span className={styles.entryBody}>
                    <span ref={textRef} id={textId} className={styles.entryText} data-clamped={!expanded || undefined}>
                        {text}
                    </span>
                    {details}
                </span>
            </button>
            {(clipped || expanded) && (
                <div className={styles.more}>
                    <Button
                        variant="text"
                        color="secondary"
                        size="small"
                        aria-expanded={expanded}
                        aria-controls={textId}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? "Show less" : "Show more"}
                    </Button>
                </div>
            )}
            {children}
        </li>
    );
}

interface ReviewSidebarProps {
    current: PrototypePage;
    describePlace: DescribeNotePlace;
    /** Opens the item's page and shows its element in the frame. */
    onShow: (item: { id: string; prototypeId: string; page: string }) => void;
    /** The item last shown from the sidebar. */
    shownId: string | null;
    overlay: boolean;
    onClose: () => void;
}

const unavailableReasons: Record<Exclude<ClaudeAvailability, "available">, string> = {
    writers_only: "Only editors of this artifact can send notes to Claude.",
    no_session: "No Claude session can receive notes right now.",
    off: "Sending to Claude is off here.",
};

/** Asks the host each time the sidebar opens, since whether Claude can receive notes changes while the Workbench is open. */
function useClaudeAvailability() {
    const host = useMemo(findWorkbenchCommentsHost, []);
    const [availability, setAvailability] = useState<ClaudeAvailability | null>(null);
    useEffect(() => {
        if (!host) {
            return;
        }
        let current = true;
        async function check() {
            try {
                const result = await host?.canSendToClaude();
                if (current) {
                    // A value a newer host may add counts as unavailable
                    setAvailability(result === "available" || (result !== undefined && result in unavailableReasons) ? result : "off");
                }
            } catch {
                if (current) {
                    setAvailability("off");
                }
            }
        }
        void check();
        return () => {
            current = false;
        };
    }, [host]);
    return { host, availability };
}

function updateNote(id: string, changes: Partial<DesignerNote>) {
    designerNoteList.update((items) => items.map((item) => (item.id === id ? { ...item, ...changes } : item)));
}

/**
 * The designer notes of all prototypes, grouped by page with the shown page first: shows a note's element in the frame, edits,
 * finishes, deletes, and shares notes, as a comment on the page that hosts the Workbench or with Claude, see `WorkbenchCommentsHost`.
 */
export function NotesSidebar({ current, describePlace, onShow, shownId, overlay, onClose }: ReviewSidebarProps) {
    const notes = designerNoteList.useItems();
    const [scope, setScope] = useState<NoteScope>("all");
    const [status, setStatus] = useState<NoteStatusFilter>("all");
    const [editing, setEditing] = useState<{ id: string; draft: string } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sharing, setSharing] = useState<{ id: string; target: NoteShareTarget } | null>(null);
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const { host, availability } = useClaudeAvailability();
    const shownNotes = filterNotes(notes, { scope, status }, current);
    const openCount = notes.filter((note) => !isNoteDone(note)).length;
    const deletingNote = notes.find((note) => note.id === deletingId);

    function saveEdit() {
        if (editing && editing.draft.trim() !== "") {
            updateNote(editing.id, { text: editing.draft.trim() });
        }
        setEditing(null);
    }

    async function share(note: DesignerNote, target: NoteShareTarget) {
        const comment = formatNoteComment(note, describePlace(note));
        if (!host) {
            const copied = await copyText(comment.text);
            addToast(
                copied
                    ? {
                          color: "info",
                          message:
                              target === "claude"
                                  ? "Copied the note – paste it into the chat with Claude"
                                  : "Copied the note – this page can't post comments, so paste it where it belongs",
                      }
                    : { color: "error", message: "Couldn't copy the note to the clipboard" },
            );
            return;
        }
        setSharing({ id: note.id, target });
        try {
            await (target === "claude" ? host.sendToClaude(comment) : host.post(comment));
            updateNote(note.id, { sharedAt: new Date().toISOString(), sharedAs: target });
            addToast({ message: target === "claude" ? "Sent the note to Claude" : "Posted the note as a comment" });
        } catch (error) {
            addToast({ color: "error", message: error instanceof Error ? error.message : String(error) });
        } finally {
            setSharing(null);
        }
    }

    const canSendToClaude = !host || availability === "available";

    return (
        <WorkbenchSidebar
            title="Designer Notes"
            count={`${openCount} open · ${notes.length}`}
            overlay={overlay}
            onClose={onClose}
            filters={
                <>
                    <SegmentedControl size="small" aria-label="Pages" options={scopeOptions} value={scope} onChange={setScope} />
                    <SegmentedControl size="small" aria-label="Status" options={statusOptions} value={status} onChange={setStatus} />
                </>
            }
            storageNote="Saved in this browser only: not on other devices, and gone when the site data is cleared. Others see a note once you post it as a comment."
            footer={
                <CopyButton
                    label="Copy all as Markdown"
                    disabled={notes.length === 0}
                    getText={() => formatNotesMarkdown(notes, describePlace, current)}
                />
            }
        >
            {host && availability && availability !== "available" && <p className={styles.hint}>{unavailableReasons[availability]}</p>}
            {shownNotes.length === 0 ? (
                <p className={styles.hint}>{notes.length === 0 ? "Click on the page to pin a note to an element." : "No notes match the filters."}</p>
            ) : (
                groupByPage(shownNotes, current).map((group) => {
                    const place = describePlace(group);
                    return (
                        <section key={group.key} className={styles.group}>
                            <h3 className={styles.groupTitle}>
                                {place.pageLabel}
                                <span>{place.prototypeName}</span>
                            </h3>
                            <ol className={styles.list}>
                                {group.items.map((note) => (
                                    <SidebarEntry
                                        key={note.id}
                                        text={note.text || "Empty note"}
                                        number={getNoteNumber(notes, note)}
                                        shown={note.id === shownId}
                                        done={isNoteDone(note)}
                                        onShow={() => onShow(note)}
                                        details={
                                            <>
                                                {note.element && <span className={styles.meta}>{note.element}</span>}
                                                {note.view && <span className={styles.meta}>{formatViewSettings(note.view)}</span>}
                                                <span className={styles.meta}>
                                                    {isNoteDone(note) ? "Done" : "Open"}
                                                    {note.createdAt && ` · ${formatNoteTime(note.createdAt)}`}
                                                </span>
                                                {note.sharedAt && (
                                                    <span className={styles.shared}>
                                                        <Icon name="check-circle" />
                                                        {note.sharedAs === "claude" ? "Sent to Claude" : "Posted as comment"}{" "}
                                                        {formatNoteTime(note.sharedAt)}
                                                    </span>
                                                )}
                                            </>
                                        }
                                    >
                                        {editing?.id === note.id ? (
                                            <div className={styles.editor}>
                                                <Textarea
                                                    name="note"
                                                    aria-label="Note"
                                                    value={editing.draft}
                                                    rows={3}
                                                    autoFocus
                                                    onChange={(event) => setEditing({ id: note.id, draft: event.target.value })}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                                                            saveEdit();
                                                        } else if (event.key === "Escape") {
                                                            event.preventDefault();
                                                            setEditing(null);
                                                        }
                                                    }}
                                                />
                                                <div className={styles.actions}>
                                                    <Button variant="text" color="secondary" size="small" onClick={() => setEditing(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button size="small" disabled={editing.draft.trim() === ""} onClick={saveEdit}>
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.actions}>
                                                <IconButton
                                                    variant="text"
                                                    color="secondary"
                                                    size="small"
                                                    aria-label="Edit note"
                                                    onClick={() => setEditing({ id: note.id, draft: note.text })}
                                                >
                                                    <Icon name="edit" />
                                                </IconButton>
                                                <IconButton
                                                    variant="text"
                                                    color="secondary"
                                                    size="small"
                                                    aria-label={isNoteDone(note) ? "Reopen note" : "Mark note as done"}
                                                    onClick={() => updateNote(note.id, { resolved: !isNoteDone(note) })}
                                                >
                                                    <Icon name={isNoteDone(note) ? "reset" : "check"} />
                                                </IconButton>
                                                <IconButton
                                                    variant="text"
                                                    color="secondary"
                                                    size="small"
                                                    aria-label="Delete note"
                                                    onClick={() => setDeletingId(note.id)}
                                                >
                                                    <Icon name="trash" />
                                                </IconButton>
                                                <span className={styles.actionsEnd}>
                                                    <IconButton
                                                        variant="text"
                                                        color="secondary"
                                                        size="small"
                                                        aria-label={host ? "Post as comment" : "Copy as comment"}
                                                        disabled={note.text.trim() === "" || sharing !== null}
                                                        loading={sharing?.id === note.id && sharing.target === "comment"}
                                                        onClick={() => share(note, "comment")}
                                                    >
                                                        <Icon name="chats" />
                                                    </IconButton>
                                                    <IconButton
                                                        variant="text"
                                                        color="secondary"
                                                        size="small"
                                                        aria-label={host ? "Send to Claude" : "Copy for Claude"}
                                                        disabled={note.text.trim() === "" || sharing !== null || !canSendToClaude}
                                                        loading={sharing?.id === note.id && sharing.target === "claude"}
                                                        onClick={() => share(note, "claude")}
                                                    >
                                                        <Icon name="spark" />
                                                    </IconButton>
                                                </span>
                                            </div>
                                        )}
                                    </SidebarEntry>
                                ))}
                            </ol>
                        </section>
                    );
                })
            )}
            <ConfirmDialog
                open={deletingNote !== undefined}
                onOpenChange={(open) => !open && setDeletingId(null)}
                title="Delete this note?"
                description={deletingNote?.text ? `“${deletingNote.text}” and its pin are removed for good.` : "Its pin is removed for good."}
                confirmLabel="Delete"
                confirmIcon={<Icon name="trash" />}
                color="error"
                onConfirm={() => {
                    designerNoteList.update((items) => items.filter((item) => item.id !== deletingId));
                    setDeletingId(null);
                }}
            />
            <ToastViewport toasts={toasts} onDismiss={dismissToast} />
        </WorkbenchSidebar>
    );
}

// The prototype restores the original text itself, since it would otherwise write the change back before it learns of the revert
function revertTextChanges(ids: string[]) {
    textChangeList.update((items) => items.filter((item) => !ids.includes(item.id)));
}

/**
 * The text changes of all prototypes, grouped by page with the shown page first: shows a change's element in the frame, reverts
 * changes, and copies them, all of them as a list or the chosen ones as a request to change the prototypes' code.
 */
export function TextChangesSidebar({ current, describePlace, onShow, shownId, overlay, onClose }: ReviewSidebarProps) {
    const changes = textChangeList.useItems();
    const [scope, setScope] = useState<NoteScope>("all");
    const [revertingAll, setRevertingAll] = useState(false);
    const shownChanges = filterByScope(changes, scope, current);
    const requestChanges = getCodeRequestChanges(changes);

    function setInCodeRequest(change: TextChange, inCodeRequest: boolean) {
        textChangeList.update((items) => items.map((item) => (item.id === change.id ? { ...item, inCodeRequest } : item)));
    }

    return (
        <WorkbenchSidebar
            title="Text changes"
            count={changes.length}
            overlay={overlay}
            onClose={onClose}
            filters={<SegmentedControl size="small" aria-label="Pages" options={scopeOptions} value={scope} onChange={setScope} />}
            storageNote="Saved in this browser only: not on other devices, and gone when the site data is cleared. Others see the changes once you send them."
            footer={
                <>
                    <div className={styles.footerRow}>
                        <p className={styles.footerNote}>
                            {requestChanges.length} of {changes.length} in the code request
                        </p>
                        <CopyButton
                            label="Copy code request"
                            disabled={requestChanges.length === 0}
                            getText={() => formatCodeRequest(requestChanges, describePlace)}
                        />
                    </div>
                    <div className={styles.footerRow}>
                        <Button
                            variant="text"
                            color="secondary"
                            size="small"
                            startIcon={<Icon name="undo" />}
                            disabled={shownChanges.length === 0}
                            onClick={() => setRevertingAll(true)}
                        >
                            Revert all
                        </Button>
                        <CopyButton
                            label="Copy all text changes"
                            disabled={changes.length === 0}
                            getText={() => formatTextChanges(changes, describePlace)}
                        />
                    </div>
                </>
            }
        >
            {shownChanges.length === 0 ? (
                <p className={styles.hint}>
                    {changes.length === 0
                        ? "Click a text on the page to edit it. Enter keeps the change, Escape discards it."
                        : "No text changes on this page."}
                </p>
            ) : (
                groupByPage(shownChanges, current).map((group) => {
                    const place = describePlace(group);
                    return (
                        <section key={group.key} className={styles.group}>
                            <h3 className={styles.groupTitle}>
                                {place.pageLabel}
                                <span>{place.prototypeName}</span>
                            </h3>
                            <ul className={styles.list}>
                                {group.items.map((change) => (
                                    <SidebarEntry
                                        key={change.id}
                                        text={
                                            <>
                                                <del>{change.original}</del> → {change.text}
                                            </>
                                        }
                                        shown={change.id === shownId}
                                        onShow={() => onShow(change)}
                                        details={change.element && <span className={styles.meta}>{change.element}</span>}
                                    >
                                        <div className={styles.actions}>
                                            <Switch
                                                size="small"
                                                checked={change.inCodeRequest === true}
                                                onChange={(checked) => setInCodeRequest(change, checked)}
                                            >
                                                Create code request
                                            </Switch>
                                            <span className={styles.actionsEnd}>
                                                <IconButton
                                                    variant="text"
                                                    color="secondary"
                                                    size="small"
                                                    aria-label="Revert to the original text"
                                                    onClick={() => revertTextChanges([change.id])}
                                                >
                                                    <Icon name="undo" />
                                                </IconButton>
                                            </span>
                                        </div>
                                    </SidebarEntry>
                                ))}
                            </ul>
                        </section>
                    );
                })
            )}
            <ConfirmDialog
                open={revertingAll}
                onOpenChange={setRevertingAll}
                title={`Revert ${shownChanges.length} text changes?`}
                description="The pages show their original texts again, and the changes are removed from the list."
                confirmLabel="Revert all"
                confirmIcon={<Icon name="undo" />}
                color="error"
                onConfirm={() => {
                    revertTextChanges(shownChanges.map((change) => change.id));
                    setRevertingAll(false);
                }}
            />
        </WorkbenchSidebar>
    );
}
