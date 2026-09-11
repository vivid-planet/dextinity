import { DynamicModule, Global, Module } from "@nestjs/common";

import { DAM_DOMINANT_COLOR_CALCULATOR } from "./dam.constants";
import { CalculateDominantImageColorCommand } from "./images/calculateDominantImageColor.command";
import { DamDominantColorService } from "./images/dam-dominant-color.service";
import { FileImagesResolver } from "./images/file-image.resolver";
import { createImagesController } from "./images/images.controller";
import { ImagesService } from "./images/images.service";
import { IsAllowedImageAspectRatioConstraint } from "./images/validators/is-allowed-aspect-ratio.validator";
import { IsAllowedImageSizeConstraint } from "./images/validators/is-allowed-image-size.validator";
import { IsValidImageAspectRatioConstraint } from "./images/validators/is-valid-aspect-ratio.validator";

interface DamImagesModuleOptions {
    damBasePath: string;
}

@Global()
@Module({})
export class DamImagesModule {
    private static registered = false;

    static register({ damBasePath }: DamImagesModuleOptions): DynamicModule {
        // The module is global and declares the DAM image routes. DamModule registers it internally, so registering both would
        // mount those routes twice.
        if (DamImagesModule.registered) {
            throw new Error(
                "DamImagesModule has already been registered. It is registered by DamModule, so register either DamModule or DamImagesModule, not both.",
            );
        }
        DamImagesModule.registered = true;

        return {
            module: DamImagesModule,
            providers: [
                ImagesService,
                DamDominantColorService,
                { provide: DAM_DOMINANT_COLOR_CALCULATOR, useExisting: DamDominantColorService },
                CalculateDominantImageColorCommand,
                FileImagesResolver,
                IsAllowedImageSizeConstraint,
                IsAllowedImageAspectRatioConstraint,
                IsValidImageAspectRatioConstraint,
            ],
            controllers: [createImagesController({ damBasePath })],
            exports: [ImagesService, DamDominantColorService, DAM_DOMINANT_COLOR_CALCULATOR],
        };
    }
}
