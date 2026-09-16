import { DocumentInterface, ScopeInterface } from "@dextinity/cms-api";
import { Embedded, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

export interface BrevoConfigInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";
    id: string;
    senderName: string;
    senderMail: string;
    doubleOptInTemplateId: number;
    folderId: number;
    allowedRedirectionUrl: string;
    unsubscriptionPageId: string;
    createdAt: Date;
    updatedAt: Date;
    scope: ScopeInterface;
}

export class BrevoConfigEntityFactory {
    static create({ Scope }: { Scope: Type<ScopeInterface> }): Type<BrevoConfigInterface> {
        @Entity()
        @ObjectType({
            implements: () => [DocumentInterface],
        })
        class BrevoConfig implements BrevoConfigInterface, DocumentInterface {
            [OptionalProps]?: "createdAt" | "updatedAt";

            @PrimaryKey({ columnType: "uuid" })
            @Field(() => ID)
            id: string = uuid();

            @Property({ columnType: "text" })
            @Field()
            senderMail: string;

            @Property({ columnType: "text" })
            @Field()
            senderName: string;

            @Property({ columnType: "number" })
            @Field(() => Int)
            doubleOptInTemplateId: number;

            @Property({ columnType: "int" })
            @Field(() => Int)
            folderId: number;

            @Property({ columnType: "text" })
            @Field()
            allowedRedirectionUrl: string;

            @Property({ columnType: "text" })
            @Field(() => String)
            unsubscriptionPageId: string;

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

        return BrevoConfig;
    }
}
