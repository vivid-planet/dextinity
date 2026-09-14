import { Args, Context, Int, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { IncomingMessage } from "http";

import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { DamFileImage } from "../files/entities/file-image.entity";
import { FilesService } from "../files/files.service";
import { ImagesService } from "./images.service";

@Resolver(() => DamFileImage)
@RequiredPermission(["dam"])
export class FileImagesResolver {
    constructor(
        private readonly imagesService: ImagesService,
        private readonly filesService: FilesService,
    ) {}

    @ResolveField(() => String, { nullable: true })
    async urlTemplate(@Parent() fileImage: DamFileImage, @Context("req") req: IncomingMessage): Promise<string | undefined> {
        const file = await this.filesService.findOneByImageId(fileImage.id);

        if (file) {
            const urlTemplate = this.imagesService.createUrlTemplate(
                { file },
                {
                    previewDamUrls: Boolean(req.headers["x-preview-dam-urls"]),
                },
            );
            return urlTemplate;
        }
    }

    @ResolveField(() => String, { nullable: true })
    async url(
        @Args("width", { type: () => Int }) width: number,
        @Args("height", { type: () => Int }) height: number,
        @Parent() fileImage: DamFileImage,
        @Context("req") req: IncomingMessage,
    ): Promise<string | undefined> {
        const file = await this.filesService.findOneByImageId(fileImage.id);

        if (file) {
            const urlTemplate = this.imagesService.createUrlTemplate(
                { file },
                {
                    previewDamUrls: Boolean(req.headers["x-preview-dam-urls"]),
                },
            );
            return urlTemplate.replace("$resizeWidth", String(width)).replace("$resizeHeight", String(height));
        }
    }
}
