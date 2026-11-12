import { CreateRequestContext } from "@mikro-orm/decorators/legacy";
import { MikroORM } from "@mikro-orm/postgresql";

import { ConsoleCommand, ConsoleCommandOption } from "../console-commands/console-command.decorators.js";
import type { ConsoleCommandInterface } from "../console-commands/console-command.interface.js";
import { DependenciesService } from "../dependencies/dependencies.service.js";

@ConsoleCommand({
    name: "refreshBlockIndexViews",
})
export class RefreshBlockIndexViewsCommand implements ConsoleCommandInterface {
    constructor(
        private readonly dependenciesService: DependenciesService,
        // orm is necessary, otherwise @CreateRequestContext() doesn't work
        private readonly orm: MikroORM,
    ) {}

    @CreateRequestContext()
    async run(params: string[], options: { force?: true }): Promise<void> {
        console.time("refreshing block index views");
        const result = await this.dependenciesService.refreshViews({ awaitRefresh: true, force: options.force });
        console.timeEnd("refreshing block index views");

        if (result === "skipped") {
            console.log("Skipped refresh: block index views are fresh enough");
        } else {
            console.log("Refreshed block index views");
        }
    }

    @ConsoleCommandOption({
        flags: "-f, --force",
        description: "Force a refresh (otherwise no update is made if the last refresh was less than 5 minutes ago)",
    })
    parseForce() {}
}
