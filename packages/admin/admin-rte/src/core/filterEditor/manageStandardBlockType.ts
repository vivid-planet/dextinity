import type { FilterEditorStateBeforeUpdateFn } from "../Rte";
import changeBlockType from "./utils/changeBlockType";

// when standard-block-type is not "unstyled", all non-empty blocks with block-type of "unstyled" are changed to the standard-block-type
//
const manageStandardBlockType: FilterEditorStateBeforeUpdateFn = (newState, { standardBlockType }) => {
    if (standardBlockType !== "unstyled") {
        // only replace empty blocks
        // unstyled blocks with content are preserved
        return changeBlockType(["unstyled"], standardBlockType, { skipNonEmptyBlocks: true })(newState);
    }
    return newState;
};

export default manageStandardBlockType;
