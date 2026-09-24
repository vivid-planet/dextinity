import type { ResolvedPos } from "@tiptap/pm/model";
import type { EditorState } from "@tiptap/pm/state";

import { findStyle, type TipTapResolvedList, type TipTapTextBlockStyle } from "./textStyles";

export const listTypes = ["orderedList", "bulletList"] as const;

export type TipTapListType = (typeof listTypes)[number];

export type ListStylesByType = Record<TipTapListType, TipTapTextBlockStyle[]>;

export const buildListStylesByType = ({
    orderedList,
    unorderedList,
}: {
    orderedList: TipTapResolvedList;
    unorderedList: TipTapResolvedList;
}): ListStylesByType => ({ orderedList: orderedList.styles, bulletList: unorderedList.styles });

interface InnermostList {
    type: TipTapListType;
    pos: number;
    textStyle: string | null;
}

/**
 * The list a position sits in, which is the innermost one: a nested list is a node of its own and
 * therefore carries its own style, independent of the list around it.
 */
export function findInnermostList($pos: ResolvedPos): InnermostList | undefined {
    for (let depth = $pos.depth; depth > 0; depth--) {
        const node = $pos.node(depth);
        const type = listTypes.find((listType) => listType === node.type.name);
        if (type) {
            return { type, pos: $pos.before(depth), textStyle: node.attrs.textStyle ?? null };
        }
    }
    return undefined;
}

export const findInnermostListOfSelection = (state: EditorState): InnermostList | undefined => findInnermostList(state.selection.$from);

/**
 * The style a text block at a position inherits from the list it is an item of.
 */
export function findListStyle($pos: ResolvedPos, stylesByType: ListStylesByType): TipTapTextBlockStyle | undefined {
    const list = findInnermostList($pos);
    return list ? findStyle(stylesByType[list.type], list.textStyle) : undefined;
}
