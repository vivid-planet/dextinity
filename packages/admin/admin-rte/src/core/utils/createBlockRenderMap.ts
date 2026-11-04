import { DefaultDraftBlockRenderMap, type DraftBlockRenderConfig, type DraftBlockType } from "draft-js";
import * as Immutable from "immutable";

import type { IBlocktypeConfig, IBlocktypeMap } from "../types";

export default function createBlockRenderMap({ blocktypeMap }: { blocktypeMap: IBlocktypeMap }) {
    const customBlockRenderMapObject = Object.entries<IBlocktypeConfig>(blocktypeMap).reduce<{
        [key: string]: DraftBlockRenderConfig;
    }>((a, [key, config]) => {
        if (config.renderConfig) {
            a[key] = config.renderConfig as DraftBlockRenderConfig; // draftjs types do not match our type, but our type is more accurate
        }
        return a;
    }, {});
    const customBlockRenderMap = Immutable.Map<DraftBlockType, DraftBlockRenderConfig>(customBlockRenderMapObject);

    return customBlockRenderMap ? DefaultDraftBlockRenderMap.merge(customBlockRenderMap) : DefaultDraftBlockRenderMap;
}
