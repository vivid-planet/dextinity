import { DocumentInterface } from "@dextinity/cms-api";
import { Collection, Embedded, Entity, ManyToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { EmailCampaignInterface } from "../../email-campaign/entities/email-campaign-entity.factory";
import { BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../../types";

export interface TargetGroupInterface {
    [OptionalProps]?: "createdAt" | "updatedAt" | "totalSubscribers";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    isMainList: boolean;
    brevoId: number;
    totalSubscribers: number;
    scope: EmailCampaignScopeInterface;
    filters?: BrevoContactFilterAttributesInterface;
    assignedContactsTargetGroupBrevoId?: number;
    campaigns: Collection<EmailCampaignInterface, object>;
    isTestList: boolean;
}

export function createTargetGroupEntity({
    Scope,
    BrevoFilterAttributes,
}: {
    Scope: Type<EmailCampaignScopeInterface>;
    BrevoFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
}): Type<TargetGroupInterface> {
    @Entity({ abstract: true })
    @ObjectType({
        implements: () => [DocumentInterface],
        isAbstract: true,
    })
    class TargetGroupBase implements TargetGroupInterface, DocumentInterface {
        [OptionalProps]?: "createdAt" | "updatedAt" | "totalSubscribers";

        @PrimaryKey({ columnType: "uuid" })
        @Field(() => ID)
        id: string = uuid();

        @Property({ columnType: "timestamp with time zone" })
        @Field()
        createdAt: Date = new Date();

        @Property({ columnType: "timestamp with time zone", onUpdate: () => new Date() })
        @Field()
        updatedAt: Date = new Date();

        @Property({ columnType: "text" })
        @Field()
        title: string;

        @Property({ columnType: "boolean" })
        @Field()
        isMainList: boolean;

        @Property({ columnType: "boolean" })
        @Field()
        isTestList: boolean;

        @Property({ columnType: "int" })
        @Field(() => Int)
        brevoId: number;

        @Field(() => Int)
        totalSubscribers: number;

        @Embedded(() => Scope)
        @Field(() => Scope)
        scope: typeof Scope;

        @Property({ columnType: "int", nullable: true })
        @Field(() => Int, { nullable: true })
        assignedContactsTargetGroupBrevoId?: number;

        @ManyToMany("BrevoEmailCampaign", "targetGroups")
        campaigns = new Collection<EmailCampaignInterface>(this);
    }
    if (BrevoFilterAttributes) {
        @Entity()
        @ObjectType({
            implements: () => [DocumentInterface],
        })
        class BrevoTargetGroup extends TargetGroupBase {
            @Embedded(() => BrevoFilterAttributes, { nullable: true })
            @Field(() => BrevoFilterAttributes, { nullable: true })
            filters?: BrevoContactFilterAttributesInterface;
        }

        return BrevoTargetGroup;
    }

    @Entity()
    @ObjectType({
        implements: () => [DocumentInterface],
    })
    class BrevoTargetGroup extends TargetGroupBase {}

    return BrevoTargetGroup;
}
