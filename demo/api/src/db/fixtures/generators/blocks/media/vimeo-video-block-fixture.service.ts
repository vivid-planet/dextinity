import { ExtractBlockInputFactoryProps, VimeoVideoBlock } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";

import { PixelImageBlockFixtureService } from "./pixel-image-block-fixture.service";

@Injectable()
export class VimeoVideoBlockFixtureService {
    constructor(private readonly pixelImageBlockFixtureService: PixelImageBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof VimeoVideoBlock>> {
        const identifier = ["76979871"];
        const autoplay = faker.datatype.boolean();

        return {
            autoplay,
            loop: faker.datatype.boolean(),
            showControls: !autoplay,
            vimeoIdentifier: faker.helpers.arrayElement(identifier),
            previewImage: await this.pixelImageBlockFixtureService.generateBlockInput(),
        };
    }
}
