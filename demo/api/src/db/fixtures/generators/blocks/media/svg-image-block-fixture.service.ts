import type { ExtractBlockInputFactoryProps, SvgImageBlock } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";

import { ImageFixtureService } from "../../image-fixture.service.js";

@Injectable()
export class SvgImageBlockFixtureService {
    constructor(private readonly imageFixtureService: ImageFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof SvgImageBlock>> {
        return {
            damFileId: this.imageFixtureService.getRandomSvg().id,
        };
    }
}
