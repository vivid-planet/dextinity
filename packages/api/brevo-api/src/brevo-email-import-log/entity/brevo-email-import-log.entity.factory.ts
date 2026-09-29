import { DocumentInterface, IsUndefinable } from "@dextinity/cms-api";
import { Embedded, Entity, Enum, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { EmailCampaignScopeInterface } from "../../types";

export interface BrevoEmailImportLogInterface {
    importedEmail: string;
    responsibleUserId: string;
    scope: EmailCampaignScopeInterface;
    createdAt: Date;
    updatedAt: Date;
    contactSource: ContactSource;
    importId?: string;
}

export enum ContactSource {
    manualCreation = "manualCreation",
    csvImport = "csvImport",
}

export function createBrevoEmailImportLogEntity({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }): Type<BrevoEmailImportLogInterface> {
    @Entity()
    @ObjectType({
        implements: () => [DocumentInterface],
    })
    class BrevoEmailImportLog implements BrevoEmailImportLogInterface, DocumentInterface {
        [OptionalProps]?: "createdAt" | "updatedAt";

        @PrimaryKey({ columnType: "uuid" })
        @Field(() => ID)
        id: string = uuid();

        @Property({ columnType: "text" })
        @Field()
        importedEmail: string;

        @Property()
        @Field()
        responsibleUserId: string;

        @Property({
            columnType: "timestamp with time zone",
        })
        @Field()
        createdAt: Date = new Date();

        @Property({
            columnType: "timestamp with time zone",
            onUpdate: () => new Date(),
        })
        @Field()
        updatedAt: Date = new Date();

        @Embedded(() => Scope)
        @Field(() => Scope)
        scope: typeof Scope;

        @Property({ columnType: "uuid" })
        @IsUndefinable()
        @Field(() => ID)
        importId?: string = uuid();

        @Property({ columnType: "text" })
        @Field(() => ContactSource)
        @Enum({ items: () => ContactSource })
        contactSource: ContactSource;
    }

    return BrevoEmailImportLog;
}
