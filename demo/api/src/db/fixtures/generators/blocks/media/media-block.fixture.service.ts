import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { MediaBlock } from "@src/common/blocks/media.block";
import { faker } from "@src/db/fixtures/faker";

import { DamImageBlockFixtureService } from "./dam-image-block-fixture.service";
import { DamVideoBlockFixtureService } from "./dam-video-block-fixture.service";
import { VimeoVideoBlockFixtureService } from "./vimeo-video-block-fixture.service";
import { YouTubeVideoBlockFixtureService } from "./youtube-video-block-fixture.service";

@Injectable()
export class MediaBlockFixtureService {
    constructor(
        private readonly damImageBlockFixtureService: DamImageBlockFixtureService,
        private readonly damVideoBlockFixtureService: DamVideoBlockFixtureService,
        private readonly youtubeVideoBlockFixtureService: YouTubeVideoBlockFixtureService,
        private readonly vimeoVideoBlockFixtureService: VimeoVideoBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof MediaBlock>> {
        const types = ["image", "damVideo", "youTubeVideo", "vimeoVideo"] as const;
        const type = faker.helpers.arrayElement(types);

        return {
            attachedBlocks: [
                {
                    type: "image",
                    props: await this.damImageBlockFixtureService.generateBlockInput(),
                },
                {
                    type: "damVideo",
                    props: await this.damVideoBlockFixtureService.generateBlockInput(),
                },
                {
                    type: "youTubeVideo",
                    props: await this.youtubeVideoBlockFixtureService.generateBlockInput(),
                },
                {
                    type: "vimeoVideo",
                    props: await this.vimeoVideoBlockFixtureService.generateBlockInput(),
                },
            ],
            activeType: type,
        };
    }
}
