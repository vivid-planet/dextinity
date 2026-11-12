import { Extension, Mark, mergeAttributes, Node } from "@tiptap/core";
import { skipTrailingNodeMeta } from "@tiptap/extensions";
import { type EditorState, Plugin } from "@tiptap/pm/state";

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

export const TextPlaceholder = Node.create({
    name: "textPlaceholder",
    group: "inline",
    inline: true,
    selectable: true,
    atom: true,

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
        return [{ tag: "span[data-type='placeholder']" }];
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
                    textAlignTypes
                        .map((type) => commands.updateAttributes(type, { textAlign: textAlign === "left" ? null : textAlign }))
                        .some(Boolean),
        };
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

export function listDepthAt(state: EditorState) {
    const { $from } = state.selection;
    let depth = 0;
    for (let level = 0; level <= $from.depth; level++) {
        const name = $from.node(level).type.name;
        if (name === "bulletList" || name === "orderedList") {
            depth++;
        }
    }
    return depth;
}

export function createListLevelMax(listLevelMax: number) {
    return Extension.create({
        name: "listLevelMax",
        priority: 1000,

        addKeyboardShortcuts() {
            return {
                Tab: ({ editor }) => editor.isActive("listItem") && listDepthAt(editor.state) >= listLevelMax,
            };
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
