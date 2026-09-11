import { ExtractBlockInputFactoryProps, YouTubeVideoBlock } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";

import { PixelImageBlockFixtureService } from "./pixel-image-block-fixture.service";

@Injectable()
export class YouTubeVideoBlockFixtureService {
    constructor(private readonly pixelImageBlockFixtureService: PixelImageBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof YouTubeVideoBlock>> {
        const identifier = ["dQw4w9WgXcQ"];
        const autoplay = faker.datatype.boolean();

        return {
            autoplay,
            loop: faker.datatype.boolean(),
            showControls: !autoplay,
            youtubeIdentifier: faker.helpers.arrayElement(identifier),
            previewImage: await this.pixelImageBlockFixtureService.generateBlockInput(),
        };
    }
}
