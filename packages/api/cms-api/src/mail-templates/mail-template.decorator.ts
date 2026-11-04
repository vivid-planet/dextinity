import { type CustomDecorator, SetMetadata } from "@nestjs/common";

import type { SendMailParams } from "../mailer/mailer.service";

export type MailTemplateMetadata = object; // placeholder for future metadata

export const MAIL_TEMPLATE_METADATA_KEY = "MAIL_TEMPLATE_METADATA_KEY";

export function isMailTemplate(arg: unknown): arg is MailTemplateInterface<unknown> {
    return (
        typeof arg === "object" &&
        arg !== null &&
        "generateMail" in arg &&
        typeof arg.generateMail === "function" &&
        "getPreparedTestProps" in arg &&
        typeof arg.getPreparedTestProps === "function"
    );
}
export type PreparedTestProps<T> = {
    props: T;
};

export type MailTemplateInterface<T> = {
    generateMail: (props: T) => Promise<SendMailParams>;
    getPreparedTestProps: () => Promise<PreparedTestProps<T>[]>;
};

export const MailTemplate = (): CustomDecorator<string> => {
    return SetMetadata<string, MailTemplateMetadata>(MAIL_TEMPLATE_METADATA_KEY, {});
};
