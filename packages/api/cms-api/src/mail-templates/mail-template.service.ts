import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { MailerService } from "../mailer/mailer.service";
import { isMailTemplate, MAIL_TEMPLATE_METADATA_KEY, MailTemplateInterface, MailTemplateMetadata } from "./mail-template.decorator";

@Injectable()
export class MailTemplateService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly mailerService: MailerService,
        private readonly discoveryService: DiscoveryService,
    ) {}

    private async getMailTemplatesWithClassName(): Promise<{ name: string; instance: MailTemplateInterface<unknown> }[]> {
        const mailTemplates: { name: string; instance: MailTemplateInterface<unknown> }[] = [];
        for (const discovery of await this.discoveryService.providersWithMetaAtKey<MailTemplateMetadata>(MAIL_TEMPLATE_METADATA_KEY)) {
            const mailTemplate = discovery.discoveredClass.instance;
            if (!isMailTemplate(mailTemplate)) {
                throw new Error(`Class ${discovery.discoveredClass.name} does not implement MailTemplateInterface`);
            }

            mailTemplates.push({ name: discovery.discoveredClass.name, instance: mailTemplate });
        }
        return mailTemplates;
    }

    async getMailTemplate<T>(className: string): Promise<MailTemplateInterface<T>> {
        const ret = (await this.getMailTemplatesWithClassName()).find((mailTemplateWithClassName) => mailTemplateWithClassName.name === className);
        if (!ret) {
            throw new Error(`MailTemplate not found: ${className}`);
        }
        return ret.instance as MailTemplateInterface<T>;
    }

    async sendMail<T>(mailTemplate: MailTemplateInterface<T>, props: T) {
        const mail = await mailTemplate.generateMail(props);

        return this.mailerService.sendMail({
            mailTypeForLogging: mailTemplate.constructor.name,
            ...mail,
        });
    }
}
