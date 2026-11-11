import { Injectable } from "@nestjs/common";

import type { BlockContext, BlockTransformerServiceInterface } from "../../blocks/block.js";
import { FilesService } from "../files/files.service.js";
import type { DamScopeInterface } from "../types.js";
import type { SvgImageBlockData } from "./svg-image.block.js";

type TransformResponse = {
    damFile: {
        id: string;
        name: string;
        size: number;
        mimetype: string;
        contentHash: string;
        title: string | null;
        altText: string | null;
        archived: boolean;
        scope: DamScopeInterface | null;
        fileUrl?: string;
    } | null;
};

@Injectable()
export class SvgImageBlockTransformerService implements BlockTransformerServiceInterface<SvgImageBlockData, TransformResponse> {
    constructor(private readonly filesService: FilesService) {}

    async transformToPlain(block: SvgImageBlockData, { includeInvisibleContent, previewDamUrls }: BlockContext): Promise<TransformResponse> {
        if (!block.damFileId) {
            return { damFile: null };
        }

        const file = await this.filesService.findOneById(block.damFileId);

        if (!file || this.filesService.isBlockedByLicense(file, { previewDamUrls })) {
            return { damFile: null };
        }

        const fileUrl = await this.filesService.createFileUrl(file, { previewDamUrls });

        return {
            damFile: {
                id: file.id,
                name: file.name,
                size: file.size,
                mimetype: file.mimetype,
                contentHash: file.contentHash,
                title: file.title ?? null,
                altText: file.altText ?? null,
                archived: file.archived,
                scope: file.scope ?? null,
                fileUrl,
            },
        };
    }
}
