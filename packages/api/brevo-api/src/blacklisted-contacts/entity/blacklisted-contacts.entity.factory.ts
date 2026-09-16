import { DocumentInterface, ScopeInterface } from "@dextinity/cms-api";
import { Embedded, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

export interface BlacklistedContactsInterface {
    hashedEmail: string;
    scope: ScopeInterface;
    createdAt: Date;
    updatedAt: Date;
}

export function createBlacklistedContactsEntity({ Scope }: { Scope: Type<ScopeInterface> }): Type<BlacklistedContactsInterface> {
    @Entity()
    @ObjectType({
        implements: () => [DocumentInterface],
    })
    class BrevoBlacklistedContacts implements BlacklistedContactsInterface, DocumentInterface {
        [OptionalProps]?: "createdAt" | "updatedAt";

        @PrimaryKey({ columnType: "uuid" })
        @Field(() => ID)
        id: string = uuid();

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
