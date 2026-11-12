import { Extension, Mark, mergeAttributes, Node } from "@tiptap/core";
import { Link } from "@tiptap/extension-link";
import { skipTrailingNodeMeta } from "@tiptap/extensions";
import { Fragment, type Node as ProseMirrorNode, Slice } from "@tiptap/pm/model";
import { type EditorState, Plugin, type Transaction } from "@tiptap/pm/state";

export type RichTextEditorTextAlign = "left" | "center" | "right" | "justify";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        nonBreakingSpace: {
            insertNonBreakingSpace: () => ReturnType;
        };
        softHyphen: {
            insertSoftHyphen: () => ReturnType;
        };
        textPlaceholder: {
            insertTextPlaceholder: (name: string) => ReturnType;
        };
        inlineStyle: {
            setInlineStyle: (name: string) => ReturnType;
            unsetInlineStyle: () => ReturnType;
        };
        textAlign: {
            setTextAlign: (textAlign: RichTextEditorTextAlign) => ReturnType;
        };
    }
}

function marksAtSelection(state: EditorState) {
    const { $from, empty } = state.selection;
    return (state.storedMarks ?? (empty ? $from.marks() : [])).map((mark) => mark.toJSON());
}

export const NonBreakingSpace = Node.create({
    name: "nonBreakingSpace",
    group: "inline",
    inline: true,
    selectable: false,
    atom: true,

    parseHTML() {
        return [{ tag: "span[data-type='non-breaking-space']" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes, { "data-type": "non-breaking-space" }), " "];
    },

    renderText() {
        return " ";
    },

    addCommands() {
        return {
            insertNonBreakingSpace:
                () =>
                ({ state, commands }) =>
                    commands.insertContent({ type: this.name, marks: marksAtSelection(state) }),
        };
    },
});

export const SoftHyphen = Node.create({
    name: "softHyphen",
    group: "inline",
    inline: true,
    selectable: false,
    atom: true,

    parseHTML() {
        return [{ tag: "span[data-type='soft-hyphen']" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes, { "data-type": "soft-hyphen" }), "­"];
    },

    renderText() {
        return "­";
    },

    addCommands() {
        return {
            insertSoftHyphen:
                () =>
                ({ state, commands }) =>
                    commands.insertContent({ type: this.name, marks: marksAtSelection(state) }),
        };
    },
});

export const TextPlaceholder = Node.create<{ names: string[] }>({
    name: "textPlaceholder",
    group: "inline",
    inline: true,
    selectable: true,
    atom: true,

    addOptions() {
        return { names: [] };
    },

    addAttributes() {
        return {
            name: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-name"),
                renderHTML: (attributes: { name: string | null }) => ({ "data-name": attributes.name }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "span[data-type='placeholder']",
                getAttrs: (element) => (this.options.names.includes(element.getAttribute("data-name") ?? "") ? null : false),
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes, { "data-type": "placeholder" }), `{{${node.attrs.name ?? ""}}}`];
    },

    renderText({ node }) {
        return `{{${node.attrs.name ?? ""}}}`;
    },

    addCommands() {
        return {
            insertTextPlaceholder:
                (name) =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name, attrs: { name } }),
        };
    },
});

export const InlineStyle = Mark.create<{ names: string[] }>({
    name: "inlineStyle",

    addOptions() {
        return { names: [] };
    },

    addAttributes() {
        return {
            name: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-inline-style"),
                renderHTML: (attributes: { name: string | null }) => ({ "data-inline-style": attributes.name }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "span[data-inline-style]",
                getAttrs: (element) => (this.options.names.includes(element.getAttribute("data-inline-style") ?? "") ? null : false),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setInlineStyle:
                (name) =>
                ({ commands }) =>
                    commands.setMark(this.name, { name }),
            unsetInlineStyle:
                () =>
                ({ commands }) =>
                    commands.unsetMark(this.name),
        };
    },
});

const textAlignTypes = ["paragraph", "heading"];

const textAlignShortcutKeys: Record<RichTextEditorTextAlign, string> = { left: "l", center: "e", right: "r", justify: "j" };

export const TextAlign = Extension.create<{ alignments: RichTextEditorTextAlign[] }>({
    name: "textAlign",

    addOptions() {
        return { alignments: ["left", "center", "right", "justify"] };
    },

    addGlobalAttributes() {
        return [
            {
                types: textAlignTypes,
                attributes: {
                    textAlign: {
                        default: null,
                        parseHTML: (element) => {
                            const textAlign = element.style.textAlign as RichTextEditorTextAlign;
                            return this.options.alignments.includes(textAlign) && textAlign !== "left" ? textAlign : null;
                        },
                        renderHTML: (attributes) => (attributes.textAlign != null ? { style: `text-align: ${attributes.textAlign}` } : {}),
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setTextAlign:
                (textAlign) =>
                ({ commands }) =>
                    this.options.alignments.includes(textAlign) &&
                    textAlignTypes
                        .map((type) => commands.updateAttributes(type, { textAlign: textAlign === "left" ? null : textAlign }))
                        .some(Boolean),
        };
    },

    addKeyboardShortcuts() {
        return Object.fromEntries(
            this.options.alignments.map((textAlign) => [
                `Mod-Shift-${textAlignShortcutKeys[textAlign]}`,
                () => this.editor.commands.setTextAlign(textAlign),
            ]),
        );
    },
});

export const SafeLink = Link.extend({
    // Link also parses target, rel, class, and title from pasted and incoming HTML; the value keeps only the target.
    addAttributes() {
        return { href: { default: null, parseHTML: (element: HTMLElement) => element.getAttribute("href") } };
    },
});

export function createMaxBlocks(maxBlocks: number) {
    return Extension.create({
        name: "maxBlocks",

        dispatchTransaction({ transaction, next }) {
            if (transaction.doc.childCount >= maxBlocks) {
                transaction.setMeta(skipTrailingNodeMeta, true);
            }
            next(transaction);
        },

        addKeyboardShortcuts() {
            return {
                Enter: ({ editor }) => {
                    const { $from } = editor.state.selection;
                    return editor.state.doc.childCount >= maxBlocks && $from.depth === 1;
                },
            };
        },

        addProseMirrorPlugins() {
            return [
                new Plugin({
                    props: {
                        transformPasted: (slice, view) => fitSliceToMaxBlocks(slice, view.state, maxBlocks),
                    },
                    filterTransaction: (transaction, state) =>
                        !transaction.docChanged ||
                        transaction.getMeta("preventUpdate") === true ||
                        transaction.doc.childCount <= maxBlocks ||
                        transaction.doc.childCount <= state.doc.childCount,
                }),
            ];
        },
    });
}

function fitSliceToMaxBlocks(slice: Slice, state: EditorState, maxBlocks: number) {
    const fits = (candidate: Slice) => state.tr.replaceSelection(candidate).doc.childCount <= Math.max(maxBlocks, state.doc.childCount);
    if (fits(slice)) {
        return slice;
    }
    for (let count = slice.content.childCount - 1; count > 0; count--) {
        const nodes: ProseMirrorNode[] = [];
        for (let index = 0; index < count; index++) {
            nodes.push(slice.content.child(index));
        }
        const candidate = new Slice(Fragment.from(nodes), slice.openStart, nodes[count - 1].isTextblock ? 1 : 0);
        if (fits(candidate)) {
            return candidate;
        }
    }
    const text = slice.content.textBetween(0, slice.content.size, " ", " ");
    return text === "" ? Slice.empty : new Slice(Fragment.from(state.schema.text(text)), 0, 0);
}

function isList(node: ProseMirrorNode) {
    return node.type.name === "bulletList" || node.type.name === "orderedList";
}

function nestedListDepth(node: ProseMirrorNode): number {
    let depth = 0;
    node.forEach((child) => {
        depth = Math.max(depth, (isList(child) ? 1 : 0) + nestedListDepth(child));
    });
    return depth;
}

/** The deepest list nesting the selected list items and their sub-lists reach; indenting them adds one. */
export function listDepthOfSelectedItems(state: EditorState) {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild?.type.name === "listItem");
    if (range == null) {
        return 0;
    }
    let depth = 0;
    for (let level = 0; level <= range.depth; level++) {
        if (isList($from.node(level))) {
            depth++;
        }
    }
    let nestedDepth = 0;
    for (let index = range.startIndex; index < range.endIndex; index++) {
        nestedDepth = Math.max(nestedDepth, nestedListDepth(range.parent.child(index)));
    }
    return depth + nestedDepth;
}

function flattenList(list: ProseMirrorNode): ProseMirrorNode[] {
    const blocks: ProseMirrorNode[] = [];
    list.forEach((item) =>
        item.forEach((child) => {
            blocks.push(...(isList(child) ? flattenList(child) : [child]));
        }),
    );
    return blocks;
}

/** Turns the items of lists nested deeper than `listLevelMax` into paragraphs of the item they're nested in. */
export function trimListNesting(transaction: Transaction, listLevelMax: number) {
    const tooDeep: { pos: number; node: ProseMirrorNode }[] = [];
    transaction.doc.descendants((node, pos) => {
        if (!isList(node)) {
            return true;
        }
        const $pos = transaction.doc.resolve(pos);
        let depth = 1;
        for (let level = 0; level <= $pos.depth; level++) {
            if (isList($pos.node(level))) {
                depth++;
            }
        }
        if (depth > listLevelMax) {
            tooDeep.push({ pos, node });
            return false;
        }
        return true;
    });
    for (const { pos, node } of tooDeep.reverse()) {
        transaction.replaceWith(pos, pos + node.nodeSize, flattenList(node));
    }
    return transaction;
}

export function createListLevelMax(listLevelMax: number) {
    return Extension.create({
        name: "listLevelMax",
        priority: 1000,

        onCreate() {
            const transaction = trimListNesting(this.editor.state.tr, listLevelMax);
            if (transaction.docChanged) {
                this.editor.view.dispatch(transaction.setMeta("preventUpdate", true).setMeta("addToHistory", false));
            }
        },

        addKeyboardShortcuts() {
            return {
                Tab: ({ editor }) => editor.isActive("listItem") && listDepthOfSelectedItems(editor.state) >= listLevelMax,
            };
        },

        addProseMirrorPlugins() {
            return [
                new Plugin({
                    appendTransaction: (transactions, _oldState, newState) => {
                        if (!transactions.some((transaction) => transaction.docChanged)) {
                            return null;
                        }
                        const transaction = trimListNesting(newState.tr, listLevelMax);
                        return transaction.docChanged ? transaction : null;
                    },
                }),
            ];
        },
    });
}

export function createLinkShortcut(onRequestLink: () => void) {
    return Extension.create({
        name: "linkShortcut",

        addKeyboardShortcuts() {
            return {
                "Mod-k": () => {
                    onRequestLink();
                    return true;
                },
            };
        },
    });
}
