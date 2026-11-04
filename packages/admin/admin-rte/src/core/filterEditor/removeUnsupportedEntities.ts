import type { DraftEntityType } from "draft-js";

import type { FilterEditorStateBeforeUpdateFn } from "../Rte";
import removeEntities from "./utils/removeEntities";

const removeUnsupportedEntities: FilterEditorStateBeforeUpdateFn = (newState, { supports }) => {
    // remove links and images
    return removeEntities((entity) => {
        const unsupportedCoreEntities: DraftEntityType[] = ["IMAGE", "TOKEN", "PHOTO"];
        if (unsupportedCoreEntities.includes(entity.getType())) {
            return false;
        }

        if (!supports.includes("link")) {
            if (entity.getType() === "LINK") {
                return false;
            }
        }
        return true;
    })(newState);
};

export default removeUnsupportedEntities;
