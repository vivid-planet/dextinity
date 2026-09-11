import { ExtractBlockInputFactoryProps, SvgImageBlock } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";

import { ImageFixtureService } from "../../image-fixture.service";

@Injectable()
export class SvgImageBlockFixtureService {
    constructor(private readonly imageFixtureService: ImageFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof SvgImageBlock>> {
        return {
            damFileId: this.imageFixtureService.getRandomSvg().id,
        };
    }
}
