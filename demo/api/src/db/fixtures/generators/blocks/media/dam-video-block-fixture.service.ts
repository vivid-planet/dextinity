import { DamVideoBlock, ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";

import { VideoFixtureService } from "../../video-fixture.service";
import { PixelImageBlockFixtureService } from "./pixel-image-block-fixture.service";

@Injectable()
export class DamVideoBlockFixtureService {
    constructor(
        private readonly videoFixtureService: VideoFixtureService,
        private readonly pixelImageBlockFixtureService: PixelImageBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof DamVideoBlock>> {
        const autoplay = faker.datatype.boolean();
        const damFileId = this.videoFixtureService.getRandomVideo().id;

        return {
            autoplay,
            loop: faker.datatype.boolean(),
            showControls: !autoplay,
            damFileId,
            previewImage: await this.pixelImageBlockFixtureService.generateBlockInput(),
        };
    }
}
