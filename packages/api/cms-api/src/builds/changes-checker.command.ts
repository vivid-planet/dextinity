import { CreateRequestContext } from "@mikro-orm/decorators/legacy";
import { MikroORM } from "@mikro-orm/postgresql";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { BuildsService } from "./builds.service";

@Command({
    name: "check-changes",
    description: "Checks if changes since last build happened and triggers a new build if so",
})
export class ChangesCheckerCommand extends CommandRunner {
    private readonly logger = new Logger(ChangesCheckerCommand.name);

    constructor(
        private readonly orm: MikroORM, // MikroORM is injected so we can use the request context
        private readonly buildsService: BuildsService,
    ) {
        super();
    }

    @CreateRequestContext()
    async run(): Promise<void> {
        this.logger.log("Checking if changes since last build occurred...");

        if (await this.buildsService.hasChangesSinceLastBuild()) {
            if (await this.buildsService.shouldRebuildAllScopes()) {
                this.logger.log("Starting build(s) for all scopes...");
                await this.buildsService.createBuildsForAllScopes("changesDetected");
            } else {
                const scopesWithChanges = await this.buildsService.getScopesWithChanges();
                const builderCronJobsToStart = await this.buildsService.getBuilderCronJobsToStart(scopesWithChanges);

                this.logger.log(`Starting build(s) for scopes: ${JSON.stringify(scopesWithChanges)}...`);
                await this.buildsService.createBuilds("changesDetected", builderCronJobsToStart);
            }

            this.logger.log("Build(s) successfully started, resetting changesSinceLastBuild...");
            await this.buildsService.deleteChangesSinceLastBuild();
            this.logger.log("Resetting changesSinceLastBuild successful!");
        } else {
            this.logger.log("No changes detected, skipping build...");
        }
    }
}
