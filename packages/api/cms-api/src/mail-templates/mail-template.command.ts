import { MikroORM } from "@mikro-orm/core";
import { CreateRequestContext } from "@mikro-orm/decorators/legacy";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { MailTemplateInterface } from "./mail-template.decorator";
import { MailTemplateService } from "./mail-template.service";

@Command({
    name: "mail-template:test",
    description: "test mail template",
    arguments: "[mailTemplateClassName] [preparedTestPropsIndex]",
})
export class MailTemplateCommand extends CommandRunner {
    private readonly logger = new Logger(MailTemplateCommand.name);

    constructor(
        private readonly orm: MikroORM,
        private readonly mailTemplateService: MailTemplateService,
    ) {
        super();
    }

    @CreateRequestContext()
    async run([mailTemplateClassName, preparedTestPropsIndex]: Array<string>): Promise<void> {
        const mailTemplate: MailTemplateInterface<unknown> = await this.mailTemplateService.getMailTemplate(mailTemplateClassName);
        const preparedTestProps = (await mailTemplate.getPreparedTestProps())[parseInt(preparedTestPropsIndex)];
        this.logger.log(`Sending test mail for ${mailTemplateClassName}`, preparedTestProps);
        await this.mailTemplateService.sendMail(mailTemplate, preparedTestProps.props);
    }
}
