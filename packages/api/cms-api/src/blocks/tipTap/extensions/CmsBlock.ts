import { mergeAttributes, Node } from "@tiptap/core";

const createCmsBlock = ({ inline }: { inline: boolean }) =>
    Node.create({
        name: inline ? "cmsInlineBlock" : "cmsBlock",
        group: inline ? "inline" : "block",
        inline,
        atom: true,
        selectable: true,
        draggable: !inline,

        addAttributes() {
            return {
                blockType: {
                    default: null,
                },
                data: {
                    default: null,
                },
            };
        },

        parseHTML() {
            return [{ tag: inline ? "span[data-cms-block]" : "div[data-cms-block]" }];
        },

        renderHTML({ HTMLAttributes }) {
            return [inline ? "span" : "div", mergeAttributes(HTMLAttributes, { "data-cms-block": "" })];
        },
    });

export const CmsBlock = createCmsBlock({ inline: false });
export const CmsInlineBlock = createCmsBlock({ inline: true });
