import { createFileUploadInputFromUrl, FileInterface, FilesService } from "@dextinity/cms-api";
import { Injectable, Logger } from "@nestjs/common";
import { DamScope } from "@src/dam/dto/dam-scope";
import path from "path";

const IMAGE_FILE_PATHS = ["astronaut", "comet", "planet", "rocket", "sun"];

@Injectable()
export class ImageFileFixtureService {
    private readonly logger = new Logger(ImageFileFixtureService.name);

    constructor(private readonly filesService: FilesService) {}

    async uploadImagesFromSrc(scope: DamScope): Promise<Array<FileInterface>> {
        const images = [];
        for (let index = 0; index < IMAGE_FILE_PATHS.length; index++) {
            this.logger.log(`Downloading ${IMAGE_FILE_PATHS[index]}.`);
            const image_path = path.resolve(`./src/db/fixtures/assets/images/${IMAGE_FILE_PATHS[index]}.png`);

            const downloadedImage = await createFileUploadInputFromUrl(image_path);
            this.logger.log(`Downloading ${IMAGE_FILE_PATHS[index]} done.`);

            this.logger.log(`Uploading ${downloadedImage.originalname}.`);
            const file = await this.filesService.upload(downloadedImage, { scope });
            this.logger.log(`Uploading ${downloadedImage.originalname} done.`);
            images.push(file);
        }
        return images;
    }
}
