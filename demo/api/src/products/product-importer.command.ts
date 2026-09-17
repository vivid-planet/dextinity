import { MikroORM } from "@mikro-orm/core";
import { CreateRequestContext } from "@mikro-orm/decorators/legacy";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { ProductImporterService } from "./product-importer.service";

@Injectable()
@Command({
    name: "importProducts",
    description: "Start product import",
    arguments: "<filePath>",
})
export class ProductImporterCommand extends CommandRunner {
    constructor(
        private readonly productImporterService: ProductImporterService,
        // orm is necessary, otherwise @CreateRequestContext() doesn't work
        private readonly orm: MikroORM,
    ) {
        super();
    }

    @CreateRequestContext()
    async run([filePath]: Array<string>): Promise<void> {
        const importer = await this.productImporterService.createImporter(filePath);
        await importer.executeRun();
    }
}
