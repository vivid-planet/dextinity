import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { ArrayType, BaseEntity, OptionalProps } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { SentMessageInfo } from "nodemailer";
import { Options as MailOptions } from "nodemailer/lib/mailer";
import { v4 as uuid } from "uuid";

import { MailerLogStatus } from "./mailer-log-status.enum";

@ObjectType()
@Entity()
export class MailerLog<AdditionalData> extends BaseEntity {
    [OptionalProps]?: "createdAt";

    @Field(() => ID)
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Enum({ items: () => MailerLogStatus })
    @Field(() => MailerLogStatus)
    status: MailerLogStatus = MailerLogStatus.error;

    @Field(() => [String])
    @Property({ type: ArrayType })
    to: string[];

    @Property({ type: "string", columnType: "text", nullable: true })
    subject?: string;

    @Field()
    @Property({ columnType: "timestamp with time zone" })
    createdAt: Date = new Date();

    @Property({ type: "json", columnType: "jsonb" })
    mailOptions: MailOptions;

    @Property({ type: "json", columnType: "jsonb", nullable: true })
    result: SentMessageInfo;

    @Property({ type: "json", columnType: "jsonb", nullable: true })
    additionalData?: AdditionalData;

    @Property({ nullable: true, index: true })
    mailTypeForLogging?: string;

    // @Field(() => [File])
    // @OneToMany(() => File, (file) => file.mailerLog, { orphanRemoval: true })
    // attachments = new Collection<File>(this);
}
