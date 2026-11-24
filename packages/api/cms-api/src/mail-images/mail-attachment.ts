import type { SendMailParams } from "../mailer/mailer.service";

export type MailAttachment = NonNullable<SendMailParams["attachments"]>[number];
