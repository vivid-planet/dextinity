import { Injectable } from "@nestjs/common";

import { BlockContext, BlockTransformerServiceInterface } from "../../blocks/block";
import { ScopeInterface } from "../../user-permissions/interfaces/scope.interface";
import { FilesService } from "../files/files.service";
import { SvgImageBlockData } from "./svg-image.block";

type TransformResponse = {
    damFile?: {
        id: string;
        name: string;
        size: number;
        mimetype: string;
        contentHash: string;
        title?: string;
        altText?: string;
        archived: boolean;
        scope?: ScopeInterface;
        fileUrl?: string;
    };
};

@Injectable()
export class SvgImageBlockTransformerService implements BlockTransformerServiceInterface<SvgImageBlockData, TransformResponse> {
    constructor(private readonly filesService: FilesService) {}

    async transformToPlain(block: SvgImageBlockData, { includeInvisibleContent, previewDamUrls }: BlockContext) {
        if (!block.damFileId) {
            return {};
        }

        const file = await this.filesService.findOneById(block.damFileId);

        if (!file) {
            return {};
        }

        const fileUrl = await this.filesService.createFileUrl(file, { previewDamUrls });

        return {
            damFile: {
                id: file.id,
                name: file.name,
                size: file.size,
                mimetype: file.mimetype,
                contentHash: file.contentHash,
                title: file.title,
                altText: file.altText,
                archived: file.archived,
                scope: file.scope,
                fileUrl,
            },
        };
    }
}
