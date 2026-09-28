import { Injectable } from "@nestjs/common";

import { BlockContext, BlockTransformerServiceInterface, TraversableTransformBlockResponse } from "../../../blocks/block";
import { DamFileAiContentType } from "../../files/entities/ai-content-type.enum";
import { FilesService } from "../../files/files.service";
import { DamScopeInterface } from "../../types";
import { DamVideoBlockData } from "./dam-video.block";

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
        fileUrl: string;
    };
    autoplay?: boolean;
    loop?: boolean;
    showControls?: boolean;
};

@Injectable()
export class DamVideoBlockTransformerService implements BlockTransformerServiceInterface<DamVideoBlockData, TransformResponse> {
    constructor(private readonly filesService: FilesService) {}

    async transformToPlain(block: DamVideoBlockData, { previewDamUrls }: BlockContext) {
        const ret: TraversableTransformBlockResponse = {
            autoplay: block.autoplay,
            loop: block.loop,
            showControls: block.showControls,
            previewImage: block.previewImage,
        };

        if (!block.damFileId) {
            return ret;
        }

        const file = await this.filesService.findOneById(block.damFileId);

        if (file) {
            const captions = [];
            for (const caption of (await file.alternativesForThisFile.loadItems()).filter((alternative) => alternative.type === "captions")) {
                captions.push({
                    id: caption.id,
                    language: caption.language,
                    fileUrl: await this.filesService.createFileUrl(await caption.alternative.loadOrFail(), { previewDamUrls }),
                });
            }

            ret.damFile = {
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
                fileUrl: await this.filesService.createFileUrl(file, { previewDamUrls }),
                captions: captions,
            };
        }

        return ret;
    }
}
