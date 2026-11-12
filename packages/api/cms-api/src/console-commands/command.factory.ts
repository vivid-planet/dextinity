import type { INestApplicationContext } from "@nestjs/common";
import { type IEntryNestModule, NestFactory } from "@nestjs/core";

import { runCommands } from "./run-commands.js";

type ApplicationContextOptions = Parameters<typeof NestFactory.createApplicationContext>[1];

export class CommandFactory {
    static async createWithoutRunning(rootModule: IEntryNestModule, options?: ApplicationContextOptions): Promise<INestApplicationContext> {
        return NestFactory.createApplicationContext(rootModule, options);
    }

    /**
     * Runs the command passed on the command line. Errors thrown by the command are rethrown.
     */
    static async runApplication(app: INestApplicationContext): Promise<INestApplicationContext> {
        await runCommands(app);
        return app;
    }
}
