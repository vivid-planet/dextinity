import { DocumentInterface } from "@dextinity/cms-api";
import { Embedded, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { EmailCampaignScopeInterface } from "../../types";

export interface BlacklistedContactsInterface {
    hashedEmail: string;
    scope: EmailCampaignScopeInterface;
    createdAt: Date;
    updatedAt: Date;
}

export function createBlacklistedContactsEntity({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }): Type<BlacklistedContactsInterface> {
    @Entity()
    @ObjectType({
        implements: () => [DocumentInterface],
    })
    class BrevoBlacklistedContacts implements BlacklistedContactsInterface, DocumentInterface {
        [OptionalProps]?: "createdAt" | "updatedAt";

        @PrimaryKey({ columnType: "uuid" })
        @Field(() => ID)
        id: string = randomUUID();

        @Property({ columnType: "text" })
        @Field()
        hashedEmail: string;

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
    }

    return BrevoBlacklistedContacts;
}
