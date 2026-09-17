import { MikroORM } from "@mikro-orm/core";
import { CreateRequestContext } from "@mikro-orm/decorators/legacy";
import { Inject, Logger } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { MAILER_SERVICE_CONFIG } from "./mailer.constants";
import { MailerModuleConfig } from "./mailer.module";
import { MailerService } from "./mailer.service";

@Command({
    name: "mailer:send-test-mail",
    description: "test mail integration",
})
export class SendTestMailCommand extends CommandRunner {
    private readonly logger = new Logger(SendTestMailCommand.name);

    constructor(
        private readonly orm: MikroORM,
        @Inject(MAILER_SERVICE_CONFIG) private readonly mailerConfig: MailerModuleConfig,
        private readonly mailerService: MailerService,
    ) {
        super();
    }

    @Option({
        flags: "-r, --receiver [receiver]",
    })
    parseReceiver(value: string) {
        return value;
    }

    @CreateRequestContext()
    async run(_arguments: string[], { receiver }: { receiver?: string }): Promise<void> {
        const defaultReceiver = [
            ...(this.mailerConfig.sendAllMailsTo ? this.mailerConfig.sendAllMailsTo : []),
            ...(this.mailerConfig.sendAllMailsBcc ? this.mailerConfig.sendAllMailsBcc : []),
        ];
        if (!receiver && defaultReceiver.length === 0) {
            throw new Error(`No default receiver configured in config.mailer.receiver or config.mailer.bccReceiver. Please use --receiver.`);
        }

        const result = await this.mailerService.sendMail({
            mailTypeForLogging: "mail-server-communication-test",
            to: receiver || defaultReceiver,
            subject: "Mail-Server communication works",
            text: "Lorem ipsum dolor sit amet",
            html: `<div>Lorem ipsum dolor sit amet</div>`,
        });
        this.logger.log(`Test mail sent. Result: ${JSON.stringify(result)}`);
    }
}
