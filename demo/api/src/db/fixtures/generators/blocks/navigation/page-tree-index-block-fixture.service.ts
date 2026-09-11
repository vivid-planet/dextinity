import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { PageTreeIndexBlock } from "@src/common/blocks/page-tree-index.block";

@Injectable()
export class PageTreeIndexBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof PageTreeIndexBlock>> {
        return {};
    }
}
