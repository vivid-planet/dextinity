import { Injectable } from "@nestjs/common";

import type { BlockContext, BlockTransformerServiceInterface } from "../../blocks/block.js";
import { FilesService } from "../files/files.service.js";
import type { DamScopeInterface } from "../types.js";
import type { DamFileDownloadLinkBlockData, OpenFileTypeMethod } from "./dam-file-download-link.block.js";

type File = {
    id: string;
    name: string;
    fileUrl: string;
    size: number;
    mimetype: string;
    scope: DamScopeInterface | null;
    altText: string | null;
    title: string | null;
};

type TransformResponse = {
    file: File | null;
    openFileType: OpenFileTypeMethod;
};

@Injectable()
export class DamFileDownloadLinkBlockTransformerService implements BlockTransformerServiceInterface<DamFileDownloadLinkBlockData, TransformResponse> {
    constructor(private readonly filesService: FilesService) {}

    async transformToPlain(block: DamFileDownloadLinkBlockData, { includeInvisibleContent, previewDamUrls }: BlockContext) {
        const ret: TransformResponse = {
            file: null,
            openFileType: block.openFileType,
        };

        if (!block.fileId) {
            return ret;
        }

        const file = await this.filesService.findOneById(block.fileId);

        if (file && !this.filesService.isBlockedByLicense(file, { previewDamUrls })) {
            const retFile: Omit<File, "fileUrl"> = {
                id: file.id,
                name: file.name,
                size: file.size,
                mimetype: file.mimetype,
                scope: file.scope ?? null,
                altText: file.altText ?? null,
                title: file.title ?? null,
            };

            if (block.openFileType === "NewTab") {
                ret.file = {
                    ...retFile,
                    fileUrl: await this.filesService.createFileUrl(file, { previewDamUrls }),
                };
            } else if (block.openFileType === "Download") {
                ret.file = {
                    ...retFile,
                    fileUrl: await this.filesService.createFileDownloadUrl(file, { previewDamUrls }),
                };
            }
        }

        return ret;
    }
}
