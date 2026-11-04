import { CharacterMetadata, EditorState, type EntityInstance } from "draft-js";

import type { FilterEditorStateFn } from "../../types";

type FilterFn = (entity: EntityInstance) => boolean; // when function returns false the entity is removed

// inspired by https://github.com/thibaudcolas/draftjs-filters/blob/31d89177090b815b968ac2d8ec95c89d975f1e44/src/lib/filters/entities.js#L77
const removeEntities: (filterFn: FilterFn) => FilterEditorStateFn = (filterFn) => (nextState) => {
    const content = nextState.getCurrentContent();
    const blockMap = content.getBlockMap();

    const blocks: any = blockMap.map((block) => {
        let altered = false;
        const chars = block!.getCharacterList().map((char) => {
            if (!char) {
                return undefined;
            }
            const entityKey = char.getEntity();
            if (entityKey) {
                const entity = content.getEntity(entityKey);
                if (!filterFn(entity)) {
                    altered = true;
                    return CharacterMetadata.applyEntity(char, null);
                }
            }
            return char;
        });
        return altered ? block!.set("characterList", chars) : block;
    });

    return EditorState.set(nextState, {
        currentContent: content.merge({
            blockMap: blockMap.merge(blocks),
        }),
    });
};

export default removeEntities;
