import { type RefObject, useEffect, useRef, useState } from "react";

import { Button } from "../../components/button/Button";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Textarea } from "../../components/textarea/Textarea";
import { findElementByPath, getElementPath, getFrameRect, useFrameDocument } from "./frameElements";
import styles from "./FrameTools.module.scss";
import { commentList, createNoteId, isOnPage, type PinnedComment, type TextChange, textChangeList } from "./workspaceNotes";

/** The page of a prototype the notes belong to, and how to open another one. */
export interface NotePage {
    prototypeId: string;
    page: string;
    getPageLabel: (page: string) => string;
    onOpenPage: (page: string) => void;
}

// The frame's elements come from another window, so `instanceof Element` of this one doesn't recognize them
function asElement(target: EventTarget | null): Element | null {
    return target != null && (target as Node).nodeType === Node.ELEMENT_NODE ? (target as Element) : null;
}

function getOwnTextNodes(element: Element) {
    return Array.from(element.childNodes).filter((node): node is Text => node.nodeType === Node.TEXT_NODE);
}

function readOwnText(element: Element) {
    return getOwnTextNodes(element)
        .map((node) => node.nodeValue)
        .join("");
}

function hasOwnText(element: Element) {
    return readOwnText(element).trim() !== "";
}

// Editing a text that also holds texts of its child elements would change those too, which the change doesn't keep
function holdsOnlyOwnText(element: Element) {
    return hasOwnText(element) && Array.from(element.children).every((child) => child.textContent?.trim() === "");
}

// Changes the text nodes instead of replacing them, so that React can still update the ones it rendered
function writeOwnText(element: Element, text: string) {
    const [first, ...rest] = getOwnTextNodes(element);
    if (first) {
        first.nodeValue = text;
        rest.forEach((node) => (node.nodeValue = ""));
    } else {
        element.append(element.ownerDocument.createTextNode(text));
    }
}

async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function CopyButton({ getText, label }: { getText: () => string; label: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <Button
            variant="outlined"
            color="secondary"
            size="small"
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

/** Blocks the page's own reaction to clicks while a tool uses them, e.g. following a link. */
function useBlockedClicks(frameDocument: Document, onClick: (event: MouseEvent) => void, blockPointerDown = true) {
    const onClickRef = useRef(onClick);
    onClickRef.current = onClick;
    useEffect(() => {
        const block = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
        };
        const handleClick = (event: MouseEvent) => {
            block(event);
            onClickRef.current(event);
        };
        const pointerEvents = blockPointerDown ? (["pointerdown", "mousedown", "pointerup", "mouseup"] as const) : [];
        frameDocument.addEventListener("click", handleClick, true);
        for (const type of pointerEvents) {
            frameDocument.addEventListener(type, block, true);
        }
        return () => {
            frameDocument.removeEventListener("click", handleClick, true);
            for (const type of pointerEvents) {
                frameDocument.removeEventListener(type, block, true);
            }
        };
    }, [frameDocument, blockPointerDown]);
}

function formatComments(comments: PinnedComment[], getPageLabel: (page: string) => string) {
    return comments.map((comment) => `- [${getPageLabel(comment.page)}]${comment.resolved ? " (resolved)" : ""} ${comment.text}`).join("\n");
}

/**
 * Comments pinned to the page: a click puts a pin on the element under the pointer, which keeps the comment. The pins stay where
 * they were put across reloads, and the list copies all comments of the prototype, e.g. into a ticket.
 */
export function CommentLayer({ frameDocument, scale, notePage }: { frameDocument: Document; scale: number; notePage: NotePage }) {
    const comments = commentList.useItems();
    const [openId, setOpenId] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const prototypeComments = comments.filter((comment) => comment.prototypeId === notePage.prototypeId);
    const pageComments = prototypeComments.filter((comment) => isOnPage(comment, notePage.prototypeId, notePage.page));

    function open(comment: PinnedComment) {
        if (comment.id === openId) {
            return;
        }
        if (openId) {
            save(openId, draft);
        }
        setOpenId(comment.id);
        setDraft(comment.text);
    }

    function save(id: string | null, text: string) {
        if (text.trim() === "") {
            commentList.update((items) => items.filter((item) => item.id !== id));
        } else {
            commentList.update((items) => items.map((item) => (item.id === id ? { ...item, text: text.trim() } : item)));
        }
    }

    function close() {
        save(openId, draft);
        setOpenId(null);
    }

    // Switching to another tool keeps what was typed, and drops a pin that never got a comment
    const openDraftRef = useRef({ openId, draft });
    openDraftRef.current = { openId, draft };
    useEffect(
        () => () => {
            if (openDraftRef.current.openId) {
                save(openDraftRef.current.openId, openDraftRef.current.draft);
            }
        },
        [],
    );

    useBlockedClicks(frameDocument, (event) => {
        const element = asElement(event.target);
        if (!element) {
            return;
        }
        close();
        const rect = element.getBoundingClientRect();
        const comment: PinnedComment = {
            id: createNoteId(),
            prototypeId: notePage.prototypeId,
            page: notePage.page,
            path: getElementPath(element),
            x: rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0,
            y: rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0,
            text: "",
        };
        commentList.update((items) => [...items, comment]);
        open(comment);
    });

    const pins = pageComments.map((comment, index) => {
        const element = findElementByPath(frameDocument, comment.path);
        const rect = element ? getFrameRect(element) : null;
        return {
            comment,
            number: prototypeComments.indexOf(comment) + 1 || index + 1,
            position: rect ? { top: (rect.top + comment.y * rect.height) * scale, left: (rect.left + comment.x * rect.width) * scale } : null,
        };
    });
    const openPin = pins.find((pin) => pin.comment.id === openId);
    const layerHeight = (frameDocument.defaultView?.innerHeight ?? 0) * scale;
    // The layer clips what leaves the frame, so the editor stays inside it and opens above pins in the lower half
    const editorPosition = openPin?.position && {
        left: `clamp(0px, ${openPin.position.left}px, calc(100% - 260px))`,
        ...(openPin.position.top > layerHeight / 2 ? { bottom: `calc(100% - ${openPin.position.top - 32}px)` } : { top: openPin.position.top + 16 }),
    };

    return (
        <>
            <div className={styles.layer}>
                {pins.map(
                    ({ comment, number, position }) =>
                        position && (
                            <button
                                key={comment.id}
                                type="button"
                                className={styles.pin}
                                data-resolved={comment.resolved || undefined}
                                data-open={comment.id === openId || undefined}
                                style={position}
                                aria-label={`Comment ${number}: ${comment.text || "new"}`}
                                onClick={() => (comment.id === openId ? close() : open(comment))}
                            >
                                {number}
                            </button>
                        ),
                )}
                {openPin && editorPosition && (
                    <div className={styles.commentEditor} style={editorPosition}>
                        <Textarea
                            name="comment"
                            aria-label="Comment"
                            value={draft}
                            rows={3}
                            autoFocus
                            placeholder="What should change here?"
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                                    close();
                                } else if (event.key === "Escape") {
                                    close();
                                }
                            }}
                        />
                        <div className={styles.editorActions}>
                            <IconButton
                                variant="text"
                                color="secondary"
                                size="small"
                                aria-label="Delete comment"
                                onClick={() => {
                                    commentList.update((items) => items.filter((item) => item.id !== openPin.comment.id));
                                    setOpenId(null);
                                }}
                            >
                                <Icon name="trash" />
                            </IconButton>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                onClick={() =>
                                    commentList.update((items) =>
                                        items.map((item) => (item.id === openPin.comment.id ? { ...item, resolved: !item.resolved } : item)),
                                    )
                                }
                            >
                                {openPin.comment.resolved ? "Reopen" : "Resolve"}
                            </Button>
                            <Button size="small" onClick={close}>
                                Save
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <aside className={styles.card} aria-label="Comments">
                <p className={styles.cardTitle}>
                    Comments
                    <span>
                        {pageComments.length} here · {prototypeComments.length} in all
                    </span>
                </p>
                {prototypeComments.length === 0 ? (
                    <p className={styles.hint}>Click on the page to pin a comment to an element.</p>
                ) : (
                    <>
                        <ol className={styles.noteList}>
                            {prototypeComments.map((comment, index) => (
                                <li key={comment.id} data-resolved={comment.resolved || undefined}>
                                    <button
                                        type="button"
                                        className={styles.noteLink}
                                        onClick={() => {
                                            notePage.onOpenPage(comment.page);
                                            open(comment);
                                        }}
                                    >
                                        <span className={styles.noteNumber}>{index + 1}</span>
                                        <span>
                                            <span className={styles.notePage}>{notePage.getPageLabel(comment.page)}</span>
                                            {comment.text || "…"}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                        <div className={styles.cardActions}>
                            <CopyButton label="Copy as list" getText={() => formatComments(prototypeComments, notePage.getPageLabel)} />
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}

function formatTextChanges(changes: TextChange[], getPageLabel: (page: string) => string) {
    return changes.map((change) => `- [${getPageLabel(change.page)}] “${change.original.trim()}” → “${change.text.trim()}”`).join("\n");
}

/**
 * Edits the page's texts in place: a click on a text makes it editable, and the change stays on the page across reloads until it's
 * reverted. The list copies all changes of the prototype, e.g. for the copywriter.
 */
export function TextLayer({ frameDocument, notePage }: { frameDocument: Document; notePage: NotePage }) {
    const changes = textChangeList.useItems();
    const prototypeChanges = changes.filter((change) => change.prototypeId === notePage.prototypeId);

    useBlockedClicks(
        frameDocument,
        (event) => {
            const element = asElement(event.target);
            if (!element || !holdsOnlyOwnText(element) || (element as HTMLElement).isContentEditable) {
                return;
            }
            const editable = element as HTMLElement;
            const path = getElementPath(editable);
            const existing = textChangeList
                .get()
                .find((change) => isOnPage(change, notePage.prototypeId, notePage.page) && change.path.join() === path.join());
            const original = existing?.original ?? readOwnText(editable);
            const before = readOwnText(editable);
            const linesBefore = new Set(editable.querySelectorAll(":scope > br"));

            function finish(keep: boolean) {
                editable.removeEventListener("blur", handleBlur);
                editable.removeEventListener("keydown", handleKey);
                editable.removeAttribute("contenteditable");
                // Emptying a text while editing can leave a line break in place of it, and no text node to write to again
                editable.querySelectorAll(":scope > br").forEach((line) => !linesBefore.has(line) && line.remove());
                if (getOwnTextNodes(editable).length === 0) {
                    writeOwnText(editable, "");
                }
                if (!keep) {
                    writeOwnText(editable, before);
                    return;
                }
                const text = readOwnText(editable);
                textChangeList.update((items) => {
                    const others = items.filter((item) => item !== existing);
                    return text === original
                        ? others
                        : [
                              ...others,
                              { id: existing?.id ?? createNoteId(), prototypeId: notePage.prototypeId, page: notePage.page, path, original, text },
                          ];
                });
            }
            const handleBlur = () => finish(true);
            const handleKey = (keyEvent: KeyboardEvent) => {
                if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
                    keyEvent.preventDefault();
                    editable.blur();
                } else if (keyEvent.key === "Escape") {
                    keyEvent.preventDefault();
                    finish(false);
                }
            };
            editable.setAttribute("contenteditable", "plaintext-only");
            editable.addEventListener("blur", handleBlur);
            editable.addEventListener("keydown", handleKey);
            editable.focus();
        },
        false,
    );

    useEffect(() => {
        frameDocument.documentElement.dataset.workspaceEditingText = "";
        return () => {
            delete frameDocument.documentElement.dataset.workspaceEditingText;
        };
    }, [frameDocument]);

    function revert(change: TextChange) {
        if (isOnPage(change, notePage.prototypeId, notePage.page)) {
            const element = findElementByPath(frameDocument, change.path);
            if (element) {
                writeOwnText(element, change.original);
            }
        }
        textChangeList.update((items) => items.filter((item) => item.id !== change.id));
    }

    return (
        <aside className={styles.card} aria-label="Text changes">
            <p className={styles.cardTitle}>
                Text changes <span>{prototypeChanges.length}</span>
            </p>
            {prototypeChanges.length === 0 ? (
                <p className={styles.hint}>Click a text to edit it. Enter keeps the change, Escape discards it.</p>
            ) : (
                <>
                    <ul className={styles.noteList}>
                        {prototypeChanges.map((change) => (
                            <li key={change.id}>
                                <span className={styles.noteLink}>
                                    <span>
                                        <span className={styles.notePage}>{notePage.getPageLabel(change.page)}</span>
                                        <del>{change.original}</del> {change.text}
                                    </span>
                                </span>
                                <IconButton variant="text" color="secondary" size="small" aria-label="Revert" onClick={() => revert(change)}>
                                    <Icon name="undo" />
                                </IconButton>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.cardActions}>
                        <CopyButton label="Copy as list" getText={() => formatTextChanges(prototypeChanges, notePage.getPageLabel)} />
                    </div>
                </>
            )}
        </aside>
    );
}

/** Puts the edited texts back on the page whenever it renders them again, e.g. after a reload or when it opens the page again. */
export function useTextChanges({
    frameRef,
    frameLoadCount,
    prototypeId,
    page,
}: {
    frameRef: RefObject<HTMLIFrameElement | null>;
    frameLoadCount: number;
    prototypeId: string;
    page: string;
}) {
    const frameDocument = useFrameDocument(frameRef, frameLoadCount);
    const changes = textChangeList.useItems();
    useEffect(() => {
        const pageChanges = changes.filter((change) => isOnPage(change, prototypeId, page));
        if (!frameDocument?.body || pageChanges.length === 0) {
            return;
        }
        const apply = () => {
            // Until the workspace follows a page change, the frame already shows the next page, which the changes aren't for
            const shownPage = decodeURIComponent(frameDocument.defaultView?.location.hash.slice(1) ?? "");
            if (shownPage !== "" && shownPage !== page) {
                return;
            }
            for (const change of pageChanges) {
                const element = findElementByPath(frameDocument, change.path);
                if (element && !(element as HTMLElement).isContentEditable && readOwnText(element) === change.original) {
                    writeOwnText(element, change.text);
                }
            }
        };
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(frameDocument.body, { subtree: true, childList: true, characterData: true });
        return () => observer.disconnect();
    }, [frameDocument, changes, prototypeId, page]);
}
