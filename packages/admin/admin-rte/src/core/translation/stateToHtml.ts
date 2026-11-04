import type { EditorState } from "draft-js";
import { type RenderConfig, stateToHTML } from "draft-js-export-html";

import defaultBlocktypeMap from "../defaultBlocktypeMap";
import type { IOptions } from "../Rte";

export function stateToHtml({ editorState, options }: { editorState: EditorState; options: IOptions }) {
    const contentState = editorState.getCurrentContent();

    const customInlineStyleKeys = options?.customInlineStyles ? Object.keys(options.customInlineStyles) : [];

    const inlineStyles: { [styleName: string]: RenderConfig } = {
        SUB: { element: "sub" },
        SUP: { element: "sup" },
    };

    customInlineStyleKeys.forEach((item) => {
        inlineStyles[item] = { element: "span", attributes: { class: [item] } };
    });

    const entities: { id: string; data: any }[] = [];

    const html = stateToHTML(contentState, {
        inlineStyles,
        blockStyleFn: (block) => {
            const type = block.getType();

            if (!Object.keys(defaultBlocktypeMap).includes(type)) {
                return { attributes: { class: type } };
            }
        },
        entityStyleFn: (entity) => {
            const entityType = entity.getType();
            const data = entity.getData();

            if (entityType === "LINK") {
                const id = `${entities.length}`;
                entities.push({ id, data });
                return { element: "a", attributes: { id } };
            }

            throw Error(`The entityType ${entityType} is not supported.`);
        },
    });

    return { html, entities };
}
