import { BlockData, BlockField, BlockIndexData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsOptional, IsUUID } from "class-validator";

class NewsDetailBlockData extends BlockData {
    @BlockField({ nullable: true })
    id?: string;

    indexData(): BlockIndexData {
        if (this.id === undefined) {
            return {};
        }

        return {
            dependencies: [
                {
                    targetEntityName: "News",
                    id: this.id,
                },
            ],
        };
    }
}

class NewsDetailBlockInput extends BlockInput {
    @BlockField({ nullable: true })
    @IsUUID()
    @IsOptional()
    id?: string;

    transformToBlockData(): NewsDetailBlockData {
        return blockInputToData(NewsDetailBlockData, this);
    }
}

const NewsDetailBlock = createBlock(NewsDetailBlockData, NewsDetailBlockInput, "NewsDetail");

export { NewsDetailBlock };
