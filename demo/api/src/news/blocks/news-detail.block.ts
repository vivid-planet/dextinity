import { BlockData, BlockField, BlockIndexData, BlockInput, blockInputToData, createBlock } from "@dextinity/cms-api";
import { IsOptional, IsUUID } from "class-validator";

class NewsDetailBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    id?: string | null;

    indexData(): BlockIndexData {
        if (!this.id) {
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
    @BlockField({ type: "string", nullable: true })
    @IsUUID()
    @IsOptional()
    id?: string | null;

    transformToBlockData(): NewsDetailBlockData {
        return blockInputToData(NewsDetailBlockData, this);
    }
}

const NewsDetailBlock = createBlock(NewsDetailBlockData, NewsDetailBlockInput, {
    name: "NewsDetail",
    description: "The detail view of a single news entry.",
});

export { NewsDetailBlock };
