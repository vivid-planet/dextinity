import { ConsoleCommand } from "../console-commands/console-command.decorators.js";
import type { ConsoleCommandInterface } from "../console-commands/console-command.interface.js";
import { DependenciesService } from "../dependencies/dependencies.service.js";

@ConsoleCommand({
    name: "createBlockIndexViews",
    description: "Should be done after every deployment",
})
export class CreateBlockIndexViewsCommand implements ConsoleCommandInterface {
    constructor(private readonly dependenciesService: DependenciesService) {}

    async run(): Promise<void> {
        await this.dependenciesService.createViews();
    }
}
