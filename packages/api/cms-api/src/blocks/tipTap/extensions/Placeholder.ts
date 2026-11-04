import { mergeAttributes, Node } from "@tiptap/core";

export const Placeholder = Node.create({
    name: "placeholder",
    group: "inline",
    inline: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            name: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "span[data-type='placeholder']",
                getAttrs: (node) => {
                    if (typeof node === "string") {
                        return false;
                    }
                    return { name: (node as unknown as { getAttribute: (attr: string) => string | null }).getAttribute("data-name") };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const name = HTMLAttributes["data-name"] ?? HTMLAttributes.name ?? "";
        return ["span", mergeAttributes({ "data-type": "placeholder", "data-name": name }), `{{${name}}}`];
    },
});
