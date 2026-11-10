import { Command } from "commander";

import { downloadMitmproxyCommand } from "./commands/download-mitmproxy.js";
import { downloadOAuth2ProxyCommand } from "./commands/download-oauth2-proxy.js";
import { generateBlockTypes } from "./commands/generate-block-types.js";
import { installAgentFeaturesCommand } from "./commands/install-agent-features.js";
import { injectSiteConfigsCommand } from "./commands/site-configs.js";

const program = new Command();

program.addCommand(generateBlockTypes);
program.addCommand(injectSiteConfigsCommand);
program.addCommand(downloadOAuth2ProxyCommand);
program.addCommand(downloadMitmproxyCommand);
program.addCommand(installAgentFeaturesCommand);

program.parse();
