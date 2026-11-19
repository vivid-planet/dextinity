import { Injectable } from "@nestjs/common";

import type { BlockContext, BlockTransformerServiceInterface } from "../../blocks/block.js";
import type { DamFileAiContentType } from "../files/entities/ai-content-type.enum.js";
import { FilesService } from "../files/files.service.js";
import type { ImageCropArea } from "../images/entities/image-crop-area.entity.js";
import { ImagesService } from "../images/images.service.js";
import { isUsableCropArea } from "../images/images.util.js";
import type { DamScopeInterface } from "../types.js";
import type { PixelImageBlockData } from "./pixel-image.block.js";

type TransformResponse = {
    damFile: {
        id: string;
        name: string;
        size: number;
        mimetype: string;
        contentHash: string;
        title: string | null;
        altText: string | null;
        aiContentType: DamFileAiContentType | null;
        archived: boolean;
        scope: DamScopeInterface | null;
        importSourceId?: string;
        importSourceType?: string;
        image: {
            width: number;
            height: number;
            cropArea: CropAreaResponse;
            dominantColor: string | null;
        } | null;
        fileUrl?: string;
    } | null;
    cropArea: CropAreaResponse | null;
    urlTemplate?: string;
};

type CropAreaResponse = Pick<ImageCropArea, "focalPoint"> & {
    width: number | null;
    height: number | null;
    x: number | null;
    y: number | null;
};

// A crop area without dimensions, e.g. a smart crop, has none stored
function toCropAreaResponse({ focalPoint, width, height, x, y }: ImageCropArea): CropAreaResponse {
    return { focalPoint, width: width ?? null, height: height ?? null, x: x ?? null, y: y ?? null };
}

@Injectable()
export class PixelImageBlockTransformerService implements BlockTransformerServiceInterface<PixelImageBlockData, TransformResponse> {
    constructor(
        private readonly filesService: FilesService,
        private readonly imagesService: ImagesService,
    ) {}

    async transformToPlain(block: PixelImageBlockData, { includeInvisibleContent, previewDamUrls }: BlockContext): Promise<TransformResponse> {
        const emptyResponse: TransformResponse = { damFile: null, cropArea: null };

        if (!block.damFileId) {
            return emptyResponse;
        }

        const blockFile = await this.filesService.findOneById(block.damFileId);

        if (!blockFile) {
            return emptyResponse;
        }

        const blockCropArea = block.cropArea && isUsableCropArea(block.cropArea) ? block.cropArea : undefined;
        const image = await this.filesService.findImageToDeliver({ file: blockFile, cropArea: blockCropArea }, { previewDamUrls });

        if (!image) {
            return emptyResponse;
        }

        const { file, cropArea } = image;

        const fileUrl = includeInvisibleContent ? await this.filesService.createFileUrl(file, { previewDamUrls }) : undefined;

        return {
            damFile: {
                id: file.id,
                name: file.name,
                size: file.size,
                mimetype: file.mimetype,
                contentHash: file.contentHash,
                title: file.title ?? null,
                altText: file.altText ?? null,
                aiContentType: file.aiContentType ?? null,
                archived: file.archived,
                scope: file.scope ?? null,
                importSourceId: file.importSourceId,
                importSourceType: file.importSourceType,
                image: file.image
                    ? {
                          width: file.image.width,
                          height: file.image.height,
                          cropArea: toCropAreaResponse(file.image.cropArea),
                          dominantColor: file.image.dominantColor ?? null,
                      }
                    : null,
                fileUrl,
            },
            cropArea: cropArea ? toCropAreaResponse(cropArea) : null,
            urlTemplate: this.imagesService.createUrlTemplate({ file, cropArea }, { previewDamUrls }),
        };
    }
}
