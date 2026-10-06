import { createFileUploadInputFromUrl, type FileInterface, FilesService } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { DamScope } from "@src/dam/dto/dam-scope.js";
import path from "path";

@Injectable()
export class SvgImageFileFixtureService {
    constructor(private readonly filesService: FilesService) {}

    async generateImage(scope: DamScope): Promise<FileInterface> {
        const file = await createFileUploadInputFromUrl(path.resolve(`./src/db/fixtures/assets/svg/dextinity-logo.svg`));
        // Convert to what the browser would send
        file.mimetype = "image/svg+xml";
        file.originalname = "dextinity-logo.svg";
        return this.filesService.upload(file, { scope });
    }
}
