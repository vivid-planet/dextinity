import { Command, CommandRunner } from "nest-commander";

import { DependenciesService } from "../dependencies/dependencies.service.js";

@Command({
    name: "createBlockIndexViews",
    description: "Should be done after every deployment",
})
export class CreateBlockIndexViewsCommand extends CommandRunner {
    constructor(private readonly dependenciesService: DependenciesService) {
        super();
    }

    async run(): Promise<void> {
        await this.dependenciesService.createViews();
    }
}
