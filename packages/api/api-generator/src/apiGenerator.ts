import { Command } from "commander";

import { generateCommand } from "./commands/generate/generate-command.js";

const program = new Command();

program.addCommand(generateCommand);

program.parse();
