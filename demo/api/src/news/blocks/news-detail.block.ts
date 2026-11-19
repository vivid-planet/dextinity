import { BlockData, BlockField, type BlockIndexData, BlockInput, blockInputToData, createBlock, IsNullable } from "@dextinity/cms-api";
import { IsUUID } from "class-validator";

class NewsDetailBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    id: string | null;

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
    @IsNullable()
    id: string | null;

    transformToBlockData(): NewsDetailBlockData {
        return blockInputToData(NewsDetailBlockData, this);
    }
}

const NewsDetailBlock = createBlock(NewsDetailBlockData, NewsDetailBlockInput, {
    name: "NewsDetail",
    description: "The detail view of a single news entry.",
});

export { NewsDetailBlock };
