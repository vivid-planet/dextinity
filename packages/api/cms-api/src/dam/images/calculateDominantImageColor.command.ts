import { CreateRequestContext, EntityClass, EntityManager } from "@mikro-orm/postgresql";
import { Inject } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { DAM_FILE_ENTITY } from "../dam.constants";
import { FileInterface } from "../files/entities/file.entity";
import { DamDominantColorService } from "./dam-dominant-color.service";

@Command({
    name: "cms.dam.calculateDominantImageColor",
    description: "Recalculate and save dominant color of image",
})
export class CalculateDominantImageColorCommand extends CommandRunner {
    constructor(
        private readonly dominantColorService: DamDominantColorService,
        private readonly em: EntityManager,
        @Inject(DAM_FILE_ENTITY) private readonly File: EntityClass<FileInterface>,
    ) {
        super();
    }

    @CreateRequestContext()
    async run(): Promise<void> {
        console.log("Calculate dominant color of images...");

        const files = await this.em.find(this.File, { image: { $ne: null } });

        console.log(`...for ${files.length} images ...`);

        for await (const file of files) {
            const dominantColor = await this.dominantColorService.calculateDominantColor(file.contentHash);
            if (file.image) {
                if (dominantColor) {
                    console.log(`${dominantColor}, ${file.image.id}, ${file.name}`);

                    await this.em.persist(file.image.assign({ dominantColor })).flush();
                } else {
                    console.log(`No color was determined, ${file.image.id}`);
                }
            }
        }
        console.log("... done.");
    }
}
