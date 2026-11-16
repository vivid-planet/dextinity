import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { PageTreeIndexBlock } from "@src/common/blocks/page-tree-index.block.js";

@Injectable()
export class PageTreeIndexBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof PageTreeIndexBlock>> {
        return {};
    }
}
