import { useEffect, useRef, useState } from "react";

import { Button } from "../../components/button/Button";
import { Icon } from "../../components/icon/Icon";
import { IconButton } from "../../components/iconButton/IconButton";
import { Textarea } from "../../components/textarea/Textarea";
import { brandSetting } from "../brand";
import { colorSchemeSetting } from "../colorScheme";
import { densitySetting } from "../density";
import { scenarioSetting } from "../scenario";
import { readWrittenText, textLengthSetting } from "../textLength";
import { describeNoteElement, getNoteNumber } from "./designerNotes";
import { findElementByPath, type FrameRect, getElementPath, getFrameRect } from "./frameElements";
import styles from "./FrameTools.module.scss";
import { hotspotList } from "./hotspots";
import {
    createNoteId,
    type DesignerNote,
    designerNoteList,
    isOnPage,
    type NoteAnchor,
    type NoteViewSettings,
    textChangeList,
} from "./workspaceNotes";

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

/** A note or text change the sidebar asked the frame to show; `requestedAt` tells two requests for the same one apart. */
export interface NoteFocusRequest {
    id: string;
    requestedAt: number;
}

function captureViewSettings(frameDocument: Document): NoteViewSettings {
    return {
        brand: brandSetting.get(),
        colorScheme: colorSchemeSetting.get(),
        density: densitySetting.get(),
        textLength: textLengthSetting.get(),
        content: scenarioSetting.get(),
        viewportWidth: frameDocument.defaultView?.innerWidth ?? 0,
        viewportHeight: frameDocument.defaultView?.innerHeight ?? 0,
    };
}

/** Shows the element of a note the sidebar asked for, once the frame shows its page and the page has rendered it. */
function useNoteFocus({
    frameDocument,
    focusRequest,
    notes,
    notePage,
    onFound,
    onFocusHandled,
}: {
    frameDocument: Document;
    focusRequest: NoteFocusRequest | null;
    notes: Array<NoteAnchor & { id: string }>;
    notePage: NotePage;
    onFound: (id: string, element: Element) => void;
    onFocusHandled: () => void;
}) {
    useEffect(() => {
        const note = focusRequest && notes.find((item) => item.id === focusRequest.id);
        if (!note || !isOnPage(note, notePage.prototypeId, notePage.page)) {
            return;
        }
        const element = findElementByPath(frameDocument, note.path);
        if (!element) {
            return;
        }
        element.scrollIntoView({ block: "center", inline: "nearest" });
        onFound(note.id, element);
        onFocusHandled();
    });
}

/**
 * Designer notes pinned to the page: a click puts a pin on the element under the pointer, which keeps the note. The pins stay where
 * they were put across reloads; the notes sidebar lists all notes.
 */
export function NoteLayer({
    frameDocument,
    scale,
    notePage,
    focusRequest,
    onFocusHandled,
}: {
    frameDocument: Document;
    scale: number;
    notePage: NotePage;
    focusRequest: NoteFocusRequest | null;
    onFocusHandled: () => void;
}) {
    const notes = designerNoteList.useItems();
    // The text the open note had when it opened, so that closing it doesn't overwrite an edit made in the sidebar meanwhile
    const [editing, setEditing] = useState<{ id: string; draft: string; original: string } | null>(null);
    const openId = editing?.id ?? null;
    const pageNotes = notes.filter((note) => isOnPage(note, notePage.prototypeId, notePage.page));

    function open(note: DesignerNote) {
        if (note.id === openId) {
            return;
        }
        if (editing) {
            save(editing);
        }
        setEditing({ id: note.id, draft: note.text, original: note.text });
    }

    function save({ id, draft, original }: { id: string; draft: string; original: string }) {
        if (draft === original) {
            if (original.trim() === "") {
                designerNoteList.update((items) => items.filter((item) => item.id !== id));
            }
            return;
        }
        if (draft.trim() === "") {
            designerNoteList.update((items) => items.filter((item) => item.id !== id));
        } else {
            designerNoteList.update((items) => items.map((item) => (item.id === id ? { ...item, text: draft.trim() } : item)));
        }
    }

    function close() {
        if (editing) {
            save(editing);
        }
        setEditing(null);
    }

    // Switching to another tool keeps what was typed, and drops a pin that never got a note
    const editingRef = useRef(editing);
    editingRef.current = editing;
    useEffect(
        () => () => {
            if (editingRef.current) {
                save(editingRef.current);
            }
        },
        [],
    );

    useNoteFocus({
        frameDocument,
        focusRequest,
        notes,
        notePage,
        onFound: (id) => {
            const note = notes.find((item) => item.id === id);
            if (note) {
                open(note);
            }
        },
        onFocusHandled,
    });

    // Notes written before the element was recorded get it once their page shows
    useEffect(() => {
        const descriptions = new Map<string, string>();
        for (const note of pageNotes) {
            const element = note.element === undefined ? findElementByPath(frameDocument, note.path) : null;
            if (element) {
                descriptions.set(note.id, describeNoteElement(element));
            }
        }
        if (descriptions.size > 0) {
            designerNoteList.update((items) =>
                items.map((item) => (descriptions.has(item.id) ? { ...item, element: descriptions.get(item.id) } : item)),
            );
        }
    });

    useBlockedClicks(frameDocument, (event) => {
        const element = asElement(event.target);
        if (!element) {
            return;
        }
        close();
        const rect = element.getBoundingClientRect();
        const note: DesignerNote = {
            id: createNoteId(),
            prototypeId: notePage.prototypeId,
            page: notePage.page,
            path: getElementPath(element),
            x: rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0,
            y: rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0,
            text: "",
            element: describeNoteElement(element),
            view: captureViewSettings(frameDocument),
            createdAt: new Date().toISOString(),
        };
        designerNoteList.update((items) => [...items, note]);
        setEditing({ id: note.id, draft: "", original: "" });
    });

    const pins = pageNotes.map((note) => {
        const element = findElementByPath(frameDocument, note.path);
        const rect = element ? getFrameRect(element) : null;
        return {
            note,
            number: getNoteNumber(notes, note),
            position: rect ? { top: (rect.top + note.y * rect.height) * scale, left: (rect.left + note.x * rect.width) * scale } : null,
        };
    });
    const openPin = pins.find((pin) => pin.note.id === openId);
    const layerHeight = (frameDocument.defaultView?.innerHeight ?? 0) * scale;
    // The layer clips what leaves the frame, so the editor stays inside it and opens above pins in the lower half
    const editorPosition = openPin?.position && {
        left: `clamp(0px, ${openPin.position.left}px, calc(100% - 260px))`,
        ...(openPin.position.top > layerHeight / 2 ? { bottom: `calc(100% - ${openPin.position.top - 32}px)` } : { top: openPin.position.top + 16 }),
    };

    return (
        <div className={styles.layer}>
            {pins.map(
                ({ note, number, position }) =>
                    position && (
                        <button
                            key={note.id}
                            type="button"
                            className={styles.pin}
                            data-resolved={note.resolved || undefined}
                            data-open={note.id === openId || undefined}
                            style={position}
                            aria-label={`Note ${number}: ${note.text || "new"}`}
                            onClick={() => (note.id === openId ? close() : open(note))}
                        >
                            {number}
                        </button>
                    ),
            )}
            {editing && openPin && editorPosition && (
                <div className={styles.noteEditor} style={editorPosition}>
                    <Textarea
                        name="note"
                        aria-label="Note"
                        value={editing.draft}
                        rows={3}
                        autoFocus
                        placeholder="What should change here?"
                        onChange={(event) => setEditing({ ...editing, draft: event.target.value })}
                        onKeyDown={(event) => {
                            if ((event.key === "Enter" && (event.metaKey || event.ctrlKey)) || event.key === "Escape") {
                                close();
                            }
                        }}
                    />
                    <div className={styles.editorActions}>
                        <IconButton
                            variant="text"
                            color="secondary"
                            size="small"
                            aria-label="Delete note"
                            onClick={() => {
                                designerNoteList.update((items) => items.filter((item) => item.id !== openPin.note.id));
                                setEditing(null);
                            }}
                        >
                            <Icon name="trash" />
                        </IconButton>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() =>
                                designerNoteList.update((items) =>
                                    items.map((item) => (item.id === openPin.note.id ? { ...item, resolved: !item.resolved } : item)),
                                )
                            }
                        >
                            {openPin.note.resolved ? "Reopen" : "Mark done"}
                        </Button>
                        <Button size="small" onClick={close}>
                            Save
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

const highlightDuration = 1600;

/**
 * Edits the page's texts in place: a click on a text makes it editable, and the change stays on the page across reloads until it's
 * reverted. The text sidebar lists all changes.
 */
export function TextLayer({
    frameDocument,
    scale,
    notePage,
    focusRequest,
    onFocusHandled,
}: {
    frameDocument: Document;
    scale: number;
    notePage: NotePage;
    focusRequest: NoteFocusRequest | null;
    onFocusHandled: () => void;
}) {
    const changes = textChangeList.useItems();
    const [highlighted, setHighlighted] = useState<Element | null>(null);

    useNoteFocus({ frameDocument, focusRequest, notes: changes, notePage, onFound: (_id, element) => setHighlighted(element), onFocusHandled });

    useEffect(() => {
        if (!highlighted) {
            return;
        }
        const timeout = window.setTimeout(() => setHighlighted(null), highlightDuration);
        return () => window.clearTimeout(timeout);
    }, [highlighted]);

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
            const elementDescription = existing?.element ?? describeNoteElement(editable);
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
                              {
                                  ...existing,
                                  id: existing?.id ?? createNoteId(),
                                  prototypeId: notePage.prototypeId,
                                  page: notePage.page,
                                  path,
                                  original,
                                  text,
                                  element: elementDescription,
                                  createdAt: existing?.createdAt ?? new Date().toISOString(),
                              },
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

    const highlightedRect = highlighted?.isConnected ? getFrameRect(highlighted) : null;
    return (
        <div className={styles.layer}>
            {highlightedRect && (
                <div
                    className={styles.highlightBox}
                    style={{
                        top: highlightedRect.top * scale,
                        left: highlightedRect.left * scale,
                        width: highlightedRect.width * scale,
                        height: highlightedRect.height * scale,
                    }}
                />
            )}
        </div>
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
                    <div className={styles.noteEditor} style={getPickerPosition(picking, scale)}>
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
