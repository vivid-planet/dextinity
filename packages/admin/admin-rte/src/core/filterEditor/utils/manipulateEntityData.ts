import { EditorState, type EntityInstance } from "draft-js";

import type { FilterEditorStateFn } from "../../types";

type UpdateEntityDataFn = (entity: EntityInstance) => Record<string, any> | undefined; // if object is returned the entity data is updated with this object

// inspired by https://github.com/thibaudcolas/draftjs-filters/blob/31d89177090b815b968ac2d8ec95c89d975f1e44/src/lib/filters/entities.js#L179
const manipulateEntityData: (updateEntityDataFn: UpdateEntityDataFn) => FilterEditorStateFn = (updateEntityDataFn) => (nextState) => {
    const content = nextState.getCurrentContent();
    const entities: Record<string, EntityInstance> = {};

    content.getBlocksAsArray().forEach((block) => {
        if (block) {
            block.findEntityRanges(
                (char) => {
                    const entityKey = char.getEntity();
                    if (entityKey) {
                        const entity = content.getEntity(entityKey);
                        entities[entityKey] = entity;
                    }
                    return false; // irrelevant
                },
                () => {
                    // no cb needed
                },
            );
        }
    });

    Object.entries(entities).forEach(([key, entity]) => {
        const maybeNewData = updateEntityDataFn(entity);
        if (maybeNewData) {
            content.replaceEntityData(key, maybeNewData);
        }
    });

    return EditorState.set(nextState, {
        currentContent: content,
    });
};

export default manipulateEntityData;
