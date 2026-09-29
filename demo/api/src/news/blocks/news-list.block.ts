import { BlockData, BlockField, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsUUID } from "class-validator";

class NewsListBlockData extends BlockData {
    @BlockField({ type: "string", array: true })
    ids: string[];
}

class NewsListBlockInput extends BlockInput {
    @BlockField({ type: "string", array: true })
    @IsUUID(undefined, { each: true })
    ids: string[];

    transformToBlockData(): NewsListBlockData {
        return blockInputToData(NewsListBlockData, this);
    }
}

export const NewsListBlock = createBlock(NewsListBlockData, NewsListBlockInput, "NewsList");
