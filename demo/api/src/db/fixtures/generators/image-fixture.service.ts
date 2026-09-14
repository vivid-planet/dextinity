import { createFileUploadInputFromUrl, FileInterface, FilesService } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { DamScope } from "@src/dam/dto/dam-scope";
import { faker } from "@src/db/fixtures/faker";
import * as fs from "fs/promises";
import path from "path";

@Injectable()
export class ImageFixtureService {
    private readonly logger = new Logger(ImageFixtureService.name);

    private pixelImageFiles: FileInterface[] = [];
    private svgImageFiles: FileInterface[] = [];

    constructor(
        private readonly entityManager: EntityManager,
        private readonly filesService: FilesService,
    ) {}

    public getRandomPixelImage() {
        const randomIndex = faker.number.int({
            min: 0,
            max: this.pixelImageFiles.length - 1,
        });

        return this.pixelImageFiles[randomIndex];
    }

    public getRandomSvg() {
        const randomIndex = faker.number.int({
            min: 0,
            max: this.svgImageFiles.length - 1,
        });

        return this.svgImageFiles[randomIndex];
    }

    private async generatePixelImages(maximumImageCount: number, scope: DamScope): Promise<void> {
        const directory = "./src/db/fixtures/assets/images";
        const allImages = await fs.readdir(path.resolve(directory));
        const images = faker.helpers.arrayElements(allImages, maximumImageCount);

        for (const image of images) {
            const file = await createFileUploadInputFromUrl(path.resolve(`${directory}/${image}`));
            const pixelImage = await this.filesService.upload(file, { scope });

            this.pixelImageFiles.push(pixelImage);
        }

        await this.entityManager.flush();
    }

    private async generateSvgImages(maximumImageCount: number, scope: DamScope): Promise<void> {
        const svgDirectoryPath = "./src/db/fixtures/assets/svg";
        const files = await fs.readdir(path.resolve(svgDirectoryPath));

        let count = 0;
        for (const svg of files) {
            const file = await createFileUploadInputFromUrl(path.resolve(`${svgDirectoryPath}/${svg}`));
            file.mimetype = "image/svg+xml"; // mime type is undefined for svg files and wrongly typed in download function (a possible undefined type is typed as string)
            this.svgImageFiles.push(await this.filesService.upload(file, { scope }));
            count++;

            if (count === maximumImageCount) {
                break;
            }
        }
    }

    public async generateImages(maximumImageCount: number, scope: DamScope): Promise<void> {
        this.logger.log("Generate Pixel Images ...");
        await this.generatePixelImages(maximumImageCount, scope);

        this.logger.log("Generate SVG Images ...");
        await this.generateSvgImages(maximumImageCount, scope);
    }
}
