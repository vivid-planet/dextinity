import { Injectable } from "@nestjs/common";

import { BlockContext, BlockTransformerServiceInterface } from "../../blocks/block";
import { DamFileAiContentType } from "../files/entities/ai-content-type.enum";
import { FilesService } from "../files/files.service";
import { ImageCropArea } from "../images/entities/image-crop-area.entity";
import { ImagesService } from "../images/images.service";
import { DamScopeInterface } from "../types";
import { PixelImageBlockData } from "./pixel-image.block";

type TransformResponse = {
    damFile?: {
        id: string;
        name: string;
        size: number;
        mimetype: string;
        contentHash: string;
        title?: string;
        altText?: string;
        aiContentType?: DamFileAiContentType;
        archived: boolean;
        scope?: DamScopeInterface;
        importSourceId?: string;
        importSourceType?: string;
        image?: {
            width: number;
            height: number;
            cropArea: ImageCropArea;
            dominantColor?: string;
        };
        fileUrl?: string;
    };
    cropArea?: ImageCropArea;
    urlTemplate?: string;
};

@Injectable()
export class PixelImageBlockTransformerService implements BlockTransformerServiceInterface<PixelImageBlockData, TransformResponse> {
    constructor(
        private readonly filesService: FilesService,
        private readonly imagesService: ImagesService,
    ) {}

    async transformToPlain(block: PixelImageBlockData, { includeInvisibleContent, previewDamUrls }: BlockContext) {
        if (!block.damFileId) {
            return {};
        }

        const file = await this.filesService.findOneById(block.damFileId);

        if (!file) {
            return {};
        }

        const fileUrl = includeInvisibleContent ? await this.filesService.createFileUrl(file, { previewDamUrls }) : undefined;

        return {
            damFile: {
                id: file.id,
                name: file.name,
                size: file.size,
                mimetype: file.mimetype,
                contentHash: file.contentHash,
                title: file.title,
                altText: file.altText,
                aiContentType: file.aiContentType,
                archived: file.archived,
                scope: file.scope,
                importSourceId: file.importSourceId,
                importSourceType: file.importSourceType,
                image: file.image
                    ? {
                          width: file.image.width,
                          height: file.image.height,
                          cropArea: { ...file.image.cropArea },
                          dominantColor: file.image.dominantColor,
                      }
                    : undefined,
                fileUrl,
            },
            cropArea: block.cropArea ? { ...block.cropArea } : undefined,
            urlTemplate: this.imagesService.createUrlTemplate({ file, cropArea: block.cropArea }, { previewDamUrls }),
        };
    }
}
