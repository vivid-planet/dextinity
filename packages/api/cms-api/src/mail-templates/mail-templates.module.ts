import { Module } from "@nestjs/common";

import { MailerModule } from "../mailer/mailer.module.js";
import { MailTemplateCommand } from "./mail-template.command.js";
import { MailTemplateService } from "./mail-template.service.js";

@Module({
    imports: [MailerModule],
    providers: [MailTemplateService, MailTemplateCommand],
    exports: [MailTemplateService],
})
export class MailTemplatesModule {}
