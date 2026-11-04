import "draft-js/dist/Draft.css"; // important for nesting of ul/ol

import { Editor as DraftJsEditor, type EditorState } from "draft-js";
import { useRef } from "react";

import defaultBlocktypeMap, { cleanBlockTypeMap, mergeBlocktypeMaps } from "./defaultBlocktypeMap";
import { styleMap } from "./Rte";
import type { IBlocktypeMap as IBlocktypeMap, ICustomBlockTypeMap_Deprecated } from "./types";
import createBlockRenderMap from "./utils/createBlockRenderMap";

interface IRteReadOnlyOptions {
    blocktypeMap: IBlocktypeMap;
    /**
     * @deprecated use `blocktypeMap` instead
     */
    customBlockMap?: ICustomBlockTypeMap_Deprecated;
}

export type IOptions = Partial<IRteReadOnlyOptions>;

export interface IProps {
    value: EditorState;
    plainTextOnly?: boolean;
    options?: IOptions;
}

const defaultOptions: IRteReadOnlyOptions = {
    blocktypeMap: defaultBlocktypeMap,
};

const RteReadOnly = ({ value: editorState, options: passedOptions, plainTextOnly }: IProps) => {
    const editorRef = useRef<DraftJsEditor>(null);

    // merge default options with passed options
    let options = passedOptions ? { ...defaultOptions, ...passedOptions } : defaultOptions;

    // extract deprecated options and handle them specially
    let deprecatedCustomBlockMap: ICustomBlockTypeMap_Deprecated = {};
    if (options.customBlockMap) {
        deprecatedCustomBlockMap = options.customBlockMap;
        delete options.customBlockMap;
    }

    cleanBlockTypeMap(options.blocktypeMap); // mutate object and print warning when configuration is wrong

    // blocktypes need an extra merge as they have their own merge strategy
    options = {
        ...options,
        blocktypeMap: mergeBlocktypeMaps(defaultBlocktypeMap, deprecatedCustomBlockMap, options.blocktypeMap),
    };

    const blockRenderMap = createBlockRenderMap({ blocktypeMap: options.blocktypeMap });

    function handleOnChange() {
        if (editorRef.current) {
            editorRef.current.blur();
        }
    }

    if (plainTextOnly) {
        return <>{editorState.getCurrentContent().getPlainText()}</>;
    }

    return (
        <DraftJsEditor
            ref={editorRef}
            editorState={editorState}
            onChange={handleOnChange}
            spellCheck={false}
            customStyleMap={styleMap}
            readOnly={true}
            blockRenderMap={blockRenderMap}
        />
    );
};

export default RteReadOnly;
