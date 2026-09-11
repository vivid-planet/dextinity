import { createFileUploadInputFromUrl, FileUpload, FileUploadsService } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import path from "path";

@Injectable()
export class FileUploadsFixtureService {
    constructor(private readonly fileUploadsService: FileUploadsService) {}

    async generateFileUploads(): Promise<FileUpload[]> {
        const images = ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg"];
        const fileUploads: FileUpload[] = [];

        for (const image of images) {
            const file = await createFileUploadInputFromUrl(path.resolve(`./src/db/fixtures/assets/images/${image}`));
            fileUploads.push(await this.fileUploadsService.upload(file));
        }

        return fileUploads;
    }
}
