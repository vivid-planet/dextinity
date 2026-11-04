import { CharacterMetadata, EditorState } from "draft-js";

import type { FilterEditorStateFn, InlineStyleType } from "../../types";

type StyleBlacklist = InlineStyleType[];

// inspired by export const filterInlineStyles = (
const removeInlineStyles: (blockBlacklist: StyleBlacklist) => FilterEditorStateFn = (blockBlacklist) => (nextState) => {
    const content = nextState.getCurrentContent();
    const blockMap = content.getBlockMap();

    const changedBlocks: any = blockMap.map((block) => {
        let altered = false;

        const chars = block!.getCharacterList().map((char) => {
            let newChar = char!;

            char!
                .getStyle()
                .filter((type) => blockBlacklist.includes(type! as InlineStyleType))
                .forEach((type) => {
                    altered = true;
                    newChar = CharacterMetadata.removeStyle(newChar, type!);
                });

            return newChar;
        });

        return altered ? block!.set("characterList", chars) : block;
    });

    return EditorState.set(nextState, {
        currentContent: content.merge({
            blockMap: blockMap.merge(changedBlocks),
        }),
    });
};

export default removeInlineStyles;
