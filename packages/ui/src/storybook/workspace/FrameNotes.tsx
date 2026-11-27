import { useEffect, useRef, useState } from "react";

import { Button } from "../../components/button/Button";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Textarea } from "../../components/textarea/Textarea";
import { readWrittenText } from "../textLength";
import { findElementByPath, type FrameRect, getElementPath, getFrameRect } from "./frameElements";
import styles from "./FrameTools.module.scss";
import { hotspotList } from "./hotspots";
import { commentList, createNoteId, isOnPage, type PinnedComment, type TextChange, textChangeList } from "./workspaceNotes";

/** The page of a prototype the notes belong to, and how to open another one. */
export interface NotePage {
    prototypeId: string;
    page: string;
    /** The pages a hotspot can open: the ones with a design and the ones the designer added. */
    pageIds: string[];
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

// A request to paste into the chat with Claude, which changes the texts in the prototype's code, where they then stay for everyone
function formatCodeRequest(changes: TextChange[], notePage: NotePage) {
    return [
        `Please change these texts in the code of the workspace prototype \`${notePage.prototypeId}\` (packages/ui/src/storybook/workspace):`,
        ...changes.map(
            (change) => `- Page “${notePage.getPageLabel(change.page)}” (\`${change.page}\`): “${change.original.trim()}” → “${change.text.trim()}”`,
        ),
        "Then remove them from the text changes in the workspace, since the prototype shows them itself.",
    ].join("\n");
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
            // The text as written, not as Text length shows it, which the designer edits and the change keeps
            const original = existing?.original ?? readWrittenText(editable);
            const before = readOwnText(editable);
            const linesBefore = new Set(editable.querySelectorAll(":scope > br"));

            function finish(keep: boolean) {
                editable.removeEventListener("blur", handleBlur);
                editable.removeEventListener("keydown", handleKey);
                editable.removeAttribute("contenteditable");
                // A line break pasted into the text becomes a space; one left in place of an emptied text goes, and an emptied text
                // gets a text node to write to again
                editable.querySelectorAll(":scope > br").forEach((line) => {
                    if (linesBefore.has(line)) {
                        return;
                    }
                    if (readOwnText(editable).trim() === "") {
                        line.remove();
                    } else {
                        line.replaceWith(editable.ownerDocument.createTextNode(" "));
                    }
                });
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
                // A label is a single line, so Enter with or without Shift keeps the change
                if (keyEvent.key === "Enter") {
                    keyEvent.preventDefault();
                    editable.blur();
                } else if (keyEvent.key === "Escape") {
                    keyEvent.preventDefault();
                    finish(false);
                }
            };
            editable.setAttribute("contenteditable", "plaintext-only");
            writeOwnText(editable, readWrittenText(editable));
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

    // The prototype restores the original text itself, since it would otherwise write the change back before it learns of the revert
    function revert(change: TextChange) {
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
                        <CopyButton label="Copy as code request" getText={() => formatCodeRequest(prototypeChanges, notePage)} />
                    </div>
                </>
            )}
        </aside>
    );
}

/**
 * Puts the edited texts back on the page whenever it renders them again, e.g. after a reload or when it opens the page again. The
 * prototype runs it itself, so that every frame shows them, also the ones of the compare modes.
 */
export function usePageTextChanges(prototypeId: string, page: string) {
    const changes = textChangeList.useItems();
    const previousChangesRef = useRef(changes);
    useEffect(() => {
        // Until this effect follows a page change, the document already shows the next page, which the changes aren't for
        const showsPage = () => {
            const shownPage = decodeURIComponent(window.location.hash.slice(1));
            return shownPage === "" || shownPage === page;
        };
        const removedChanges = previousChangesRef.current.filter(
            (previous) => isOnPage(previous, prototypeId, page) && !changes.some((change) => change.id === previous.id),
        );
        previousChangesRef.current = changes;
        if (showsPage()) {
            for (const change of removedChanges) {
                const element = findElementByPath(document, change.path);
                if (element && !(element as HTMLElement).isContentEditable && readWrittenText(element) === change.text) {
                    writeOwnText(element, change.original);
                }
            }
        }
        const pageChanges = changes.filter((change) => isOnPage(change, prototypeId, page));
        if (pageChanges.length === 0) {
            return;
        }
        const apply = () => {
            if (!showsPage()) {
                return;
            }
            for (const change of pageChanges) {
                const element = findElementByPath(document, change.path);
                if (element && !(element as HTMLElement).isContentEditable && readWrittenText(element) === change.original) {
                    writeOwnText(element, change.text);
                }
            }
        };
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
        return () => observer.disconnect();
    }, [changes, prototypeId, page]);
}

// Opens toward the larger part of the frame, so that the layer, which clips everything outside the frame, doesn't cut the picker off
function getPickerPosition({ rect, frameWidth, frameHeight }: { rect: FrameRect; frameWidth: number; frameHeight: number }, scale: number) {
    const below = rect.top + rect.height / 2 < frameHeight / 2;
    const fromLeft = rect.left + rect.width / 2 < frameWidth / 2;
    return {
        ...(below ? { top: (rect.top + rect.height) * scale + 6 } : { bottom: (frameHeight - rect.top) * scale + 6 }),
        ...(fromLeft ? { left: rect.left * scale } : { right: (frameWidth - rect.left - rect.width) * scale }),
    };
}

/**
 * Links an element of the page to another page, without code: a click on an element offers the pages, and the prototype then
 * opens the chosen page on a click there, also outside the tool. Shown as boxes with the page they open.
 */
export function HotspotLayer({ frameDocument, scale, notePage }: { frameDocument: Document; scale: number; notePage: NotePage }) {
    const hotspots = hotspotList.useItems();
    const [picking, setPicking] = useState<{ path: number[]; rect: FrameRect; frameWidth: number; frameHeight: number } | null>(null);
    const prototypeHotspots = hotspots.filter((hotspot) => hotspot.prototypeId === notePage.prototypeId);
    const pageHotspots = prototypeHotspots.filter((hotspot) => isOnPage(hotspot, notePage.prototypeId, notePage.page));

    useBlockedClicks(frameDocument, (event) => {
        const element = asElement(event.target);
        // The page's background would take every click of the page
        if (!element || element === frameDocument.body || element === frameDocument.documentElement) {
            return;
        }
        const { clientWidth, clientHeight } = frameDocument.documentElement;
        setPicking({ path: getElementPath(element), rect: getFrameRect(element), frameWidth: clientWidth, frameHeight: clientHeight });
    });

    function link(target: string) {
        if (!picking) {
            return;
        }
        const path = picking.path;
        hotspotList.update((items) => [
            ...items.filter((item) => !(isOnPage(item, notePage.prototypeId, notePage.page) && item.path.join() === path.join())),
            { id: createNoteId(), prototypeId: notePage.prototypeId, page: notePage.page, path, target },
        ]);
        setPicking(null);
    }

    return (
        <>
            <div className={styles.layer}>
                {pageHotspots.map((hotspot) => {
                    const element = findElementByPath(frameDocument, hotspot.path);
                    if (!element) {
                        return null;
                    }
                    const rect = getFrameRect(element);
                    return (
                        <div
                            key={hotspot.id}
                            className={styles.hotspot}
                            style={{ top: rect.top * scale, left: rect.left * scale, width: rect.width * scale, height: rect.height * scale }}
                        >
                            <span className={styles.hotspotLabel}>→ {notePage.getPageLabel(hotspot.target)}</span>
                        </div>
                    );
                })}
                {picking && (
                    <div className={styles.commentEditor} style={getPickerPosition(picking, scale)}>
                        <p className={styles.cardTitle}>Opens on a click</p>
                        <ul className={styles.pagePicker}>
                            {notePage.pageIds
                                .filter((pageId) => pageId !== notePage.page)
                                .map((pageId) => (
                                    <li key={pageId}>
                                        <button type="button" className={styles.noteLink} onClick={() => link(pageId)}>
                                            {notePage.getPageLabel(pageId)}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                        <div className={styles.editorActions}>
                            <Button variant="text" color="secondary" size="small" onClick={() => setPicking(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <aside className={styles.card} aria-label="Hotspots">
                <p className={styles.cardTitle}>
                    Hotspots
                    <span>
                        {pageHotspots.length} here · {prototypeHotspots.length} in all
                    </span>
                </p>
                {prototypeHotspots.length === 0 ? (
                    <p className={styles.hint}>Click an element to choose the page it opens, e.g. a button of a page that isn&apos;t built yet.</p>
                ) : (
                    <ul className={styles.noteList}>
                        {prototypeHotspots.map((hotspot) => (
                            <li key={hotspot.id}>
                                <button type="button" className={styles.noteLink} onClick={() => notePage.onOpenPage(hotspot.page)}>
                                    <span>
                                        <span className={styles.notePage}>{notePage.getPageLabel(hotspot.page)}</span>
                                        Opens {notePage.getPageLabel(hotspot.target)}
                                    </span>
                                </button>
                                <IconButton
                                    variant="text"
                                    color="secondary"
                                    size="small"
                                    aria-label="Remove hotspot"
                                    onClick={() => hotspotList.update((items) => items.filter((item) => item.id !== hotspot.id))}
                                >
                                    <Icon name="trash" />
                                </IconButton>
                            </li>
                        ))}
                    </ul>
                )}
            </aside>
        </>
    );
}
