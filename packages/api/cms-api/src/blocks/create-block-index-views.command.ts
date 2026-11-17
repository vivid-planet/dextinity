import { Command } from "../console-commands/command.decorators.js";
import { CommandRunner } from "../console-commands/command-runner.js";
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
