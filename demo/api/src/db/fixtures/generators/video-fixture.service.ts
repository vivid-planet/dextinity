import { createFileUploadInputFromUrl, FileInterface, FilesService } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { DamScope } from "@src/dam/dto/dam-scope";
import { faker } from "@src/db/fixtures/faker";
import * as fs from "fs/promises";
import path from "path";

@Injectable()
export class VideoFixtureService {
    private videoFiles: FileInterface[] = [];

    constructor(
        private readonly entityManager: EntityManager,
        private readonly filesService: FilesService,
    ) {}

    public getRandomVideo() {
        const randomIndex = faker.number.int({
            min: 0,
            max: this.videoFiles.length - 1,
        });

        return this.videoFiles[randomIndex];
    }

    public async generateVideos(scope: DamScope): Promise<void> {
        const videoDirectoryPath = "./src/db/fixtures/assets/videos";
        const files = await fs.readdir(path.resolve(videoDirectoryPath));

        for (const video of files) {
            const file = await createFileUploadInputFromUrl(path.resolve(`${videoDirectoryPath}/${video}`));
            this.videoFiles.push(await this.filesService.upload(file, { scope }));
        }

        await this.entityManager.flush();
    }
}
