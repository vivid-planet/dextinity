import { Injectable, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";

import { Command, Option } from "./command.decorators.js";
import { CommandRunner } from "./command-runner.js";
import { runCommands } from "./run-commands.js";

@Injectable()
class GreetingService {
    greet(name: string): string {
        return `Hello ${name}`;
    }
}

const runSpy = vi.fn();

@Command({ name: "greet", arguments: "<name> [suffix]", description: "Greets someone" })
class GreetCommand extends CommandRunner {
    constructor(private readonly greetingService: GreetingService) {
        super();
    }

    async run([name, suffix]: string[], options: Record<string, unknown>): Promise<void> {
        runSpy(this.greetingService.greet(name), suffix, options);
    }

    @Option({ flags: "-t, --times <times>", defaultValue: 1 })
    parseTimes(value: string): number {
        return parseInt(value);
    }

    @Option({ flags: "-l, --loud" })
    parseLoud() {}
}

@Module({ providers: [GreetingService, GreetCommand] })
class GreetModule {}

async function run(...args: string[]): Promise<void> {
    const app = await Test.createTestingModule({ imports: [GreetModule] }).compile();
    await runCommands(app, ["node", "console", ...args]);
}

describe("runCommands", () => {
    it("runs the command with its arguments and dependencies", async () => {
        runSpy.mockClear();
        await run("greet", "World", "!");

        expect(runSpy).toHaveBeenCalledWith("Hello World", "!", { times: 1 });
    });

    it("parses options with the decorated methods", async () => {
        runSpy.mockClear();
        await run("greet", "World", "--times", "3", "--loud");

        expect(runSpy).toHaveBeenCalledWith("Hello World", undefined, { times: 3, loud: true });
    });

    it("rethrows errors thrown by the command", async () => {
        runSpy.mockImplementationOnce(() => {
            throw new Error("Failed");
        });

        await expect(run("greet", "World")).rejects.toThrow("Failed");
    });
});
