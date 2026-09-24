import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { subDays } from "date-fns";
import { htmlToText } from "html-to-text";
import { Transporter } from "nodemailer";
import Mail, { Address, Options as MailOptions } from "nodemailer/lib/mailer";

import { MailerLog } from "./entities/mailer-log.entity";
import { MailerLogStatus } from "./entities/mailer-log-status.enum";
import { MAILER_MODULE_TRANSPORT, MAILER_SERVICE_CONFIG } from "./mailer.constants";
import { MailerModuleConfig } from "./mailer.module";

type MailerServiceConfig = Omit<MailerModuleConfig, "transport">;

export type SendMailParams = MailOptions & {
    mailTypeForLogging?: string;
    additionalData?: unknown;
    logMail?: boolean;
};

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);

    constructor(
        @Inject(MAILER_SERVICE_CONFIG) private readonly mailerConfig: MailerServiceConfig,
        @Inject(MAILER_MODULE_TRANSPORT) private readonly mailerTransport: Transporter,
        private readonly entityManager: EntityManager,
        @InjectRepository(MailerLog) private readonly mailerLogRepository: EntityRepository<MailerLog<unknown>>,
    ) {}

    private fillMailOptionsDefaults(originMailOptions: MailOptions): MailOptions {
        let textMail = originMailOptions.text;

        if (typeof textMail === "undefined" && typeof originMailOptions.html === "string") {
            textMail = htmlToText(originMailOptions.html);
        }

        return {
            ...originMailOptions,
            text: textMail,
            from: originMailOptions.from || this.mailerConfig.defaultFrom,
            bcc: this.mailerConfig.sendAllMailsBcc
                ? [...this.normalizeToArray(originMailOptions.bcc), ...this.mailerConfig.sendAllMailsBcc]
                : originMailOptions.bcc,
        };
    }

    /**
     * Sends a mail and logs it in the database.
     * If mailerConfig.sendAllMailsTo is set, the mail will be sent to this address instead of the `to` address and `bcc` will be omitted. This can
     * be used to prevent non-prod environments from sending mails to real customers.
     * @param mailTypeForLogging Mail type, e.g. order confirmation, order cancellation, etc. to filter in the mailer log
     * @param additionalData Put your additional data here, e.g. orderId, resourcePoolId, etc.
     * @param originMailOptions `from` defaults to this.config.mailer.defaultFrom, sendAllMailsBcc is always added to `bcc`
     * @param logMail When set to false, the email will not be logged to the database.
     */
    async sendMail({ mailTypeForLogging, additionalData, logMail = true, ...originMailOptions }: SendMailParams): Promise<Mail> {
        const mailOptionsWithDefaults = this.fillMailOptionsDefaults(originMailOptions);

        let logEntryId: string | undefined;
        if (logMail && !this.mailerConfig.disableMailLog) {
            await this.entityManager.fork().transactional((em) => {
                const logEntry = em.getRepository(MailerLog).create({
                    status: MailerLogStatus.error,
                    to: this.normalizeToArray(originMailOptions.to).map<string>(this.convertAddressToString),
                    subject: originMailOptions.subject,
                    mailOptions: mailOptionsWithDefaults,
                    additionalData,
                    mailTypeForLogging, // for statistic and filter purposes
                });
                logEntryId = logEntry.id;
            });
        }

        // this is needed because only on production stage we are allowed to send mails to customers
        const mailOptions: MailOptions = this.mailerConfig.sendAllMailsTo
            ? { ...mailOptionsWithDefaults, to: this.mailerConfig.sendAllMailsTo, cc: undefined, bcc: undefined }
            : mailOptionsWithDefaults;

        const result = await this.mailerTransport.sendMail(mailOptions);

        if (logMail && !this.mailerConfig.disableMailLog) {
            await this.entityManager.fork().transactional(async (em) => {
                if (!logEntryId) {
                    return;
                }
                const logEntry = await em.getRepository(MailerLog).findOne({ id: logEntryId });
                if (!logEntry) {
                    return;
                }

                if (result.messageId) {
                    logEntry.assign({ status: MailerLogStatus.sent });
                }
                logEntry.assign({ result: result });
            });
        }
        if (!result.messageId) {
            throw new Error(`Sending mail failed, no messageId returned. MailOptions: ${JSON.stringify(mailOptions)}`);
        }

        // Delete outdated logs, purposely not using await because it is not important for the mail sending process
        void this.mailerLogRepository.nativeDelete({ createdAt: { $lt: subDays(new Date(), this.mailerConfig.daysToKeepMailLog ?? 90) } });

        return result;
    }

    private convertAddressToString(item: string | Mail.Address) {
        return typeof item === "string" ? item : `${item.name} <${item.address}>`;
    }

    private normalizeToArray(item: string | Address | Array<string | Address> | undefined): Array<string | Address> {
        return item ? (Array.isArray(item) ? item : [item]) : [];
    }
}
