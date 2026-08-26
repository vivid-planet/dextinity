import { DamImageBlock, ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";

import { PixelImageBlockFixtureService } from "./pixel-image-block-fixture.service";
import { SvgImageBlockFixtureService } from "./svg-image-block-fixture.service";

interface GenerateDamImageBlockInputProps {
    generateSvgImage?: boolean;
}

@Injectable()
export class DamImageBlockFixtureService {
    constructor(
        private readonly svgImageBlockFixtureService: SvgImageBlockFixtureService,
        private readonly pixelImageBlockFixtureService: PixelImageBlockFixtureService,
    ) {}

    async generateBlockInput(settings?: GenerateDamImageBlockInputProps): Promise<ExtractBlockInputFactoryProps<typeof DamImageBlock>> {
        const types = ["pixelImage", "svgImage"] as const;
        const type = settings?.generateSvgImage === true ? faker.helpers.arrayElement(types) : "pixelImage";

        switch (type) {
            case "svgImage":
                return {
                    attachedBlocks: [{ type, props: await this.svgImageBlockFixtureService.generateBlockInput() }],
                    activeType: type,
                };
            case "pixelImage":
                return {
                    attachedBlocks: [{ type, props: await this.pixelImageBlockFixtureService.generateBlockInput() }],
                    activeType: type,
                };
        }
    }
}
