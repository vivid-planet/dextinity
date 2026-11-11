import { BlockData, BlockField, BlockIndexData, BlockInput, blockInputToData, createBlock, IsUndefinable } from "@dextinity/cms-api";
import { IsUUID } from "class-validator";

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
    @IsUndefinable()
    id?: string;

    transformToBlockData(): NewsDetailBlockData {
        return blockInputToData(NewsDetailBlockData, this);
    }
}

const NewsDetailBlock = createBlock(NewsDetailBlockData, NewsDetailBlockInput, {
    name: "NewsDetail",
    description: "The detail view of a single news entry.",
});

export { NewsDetailBlock };
