import { type DynamicModule, Global, Module } from "@nestjs/common";

import { DamFileDownloadLinkBlockTransformerService } from "./blocks/dam-file-download-link-block-transformer.service.js";
import { PixelImageBlockTransformerService } from "./blocks/pixel-image-block-transformer.service.js";
import { SvgImageBlockTransformerService } from "./blocks/svg-image-block-transformer.service.js";
import { DamVideoBlockTransformerService } from "./blocks/video/dam-video-block-transformer.service.js";

@Global()
@Module({})
export class DamBlocksModule {
    private static registered = false;

    static register(): DynamicModule {
        // The module is global and exports the block transformer services. DamModule registers it internally, so registering both
        // would leave two instances of each service, one of them silently unused.
        if (DamBlocksModule.registered) {
            throw new Error(
                "DamBlocksModule has already been registered. It is registered by DamModule, so register either DamModule or DamBlocksModule, not both.",
            );
        }
        DamBlocksModule.registered = true;

        return {
            module: DamBlocksModule,
            providers: [
                PixelImageBlockTransformerService,
                SvgImageBlockTransformerService,
                DamVideoBlockTransformerService,
                DamFileDownloadLinkBlockTransformerService,
            ],
            exports: [PixelImageBlockTransformerService, SvgImageBlockTransformerService, DamVideoBlockTransformerService],
        };
    }
}
