import { Block, BlockDataInterface, DocumentInterface, RootBlock, RootBlockDataScalar, RootBlockType } from "@dextinity/cms-api";
import { Collection, Embedded, Entity, Enum, ManyToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { TargetGroupInterface } from "../../target-group/entity/target-group-entity.factory";
import { EmailCampaignScopeInterface } from "../../types";
import { SendingState } from "../sending-state.enum";

export interface EmailCampaignInterface {
    [OptionalProps]?: "createdAt" | "updatedAt" | "sendingState";
    id: string;
    createdAt: Date;
    scheduledAt?: Date;
    title: string;
    subject: string;
    brevoId?: number;
    updatedAt: Date;
    content: BlockDataInterface;
    scope: EmailCampaignScopeInterface;
    sendingState: SendingState;
    targetGroups: Collection<TargetGroupInterface, object>;
    unsubscriptionPageId?: string;
}

export function createEmailCampaignEntity({
    EmailCampaignContentBlock,
    Scope,
    TargetGroup: BrevoTargetGroup,
}: {
    EmailCampaignContentBlock: Block;
    Scope: Type<EmailCampaignScopeInterface>;
    TargetGroup: Type<TargetGroupInterface>;
}): Type<EmailCampaignInterface> {
    @Entity()
    @ObjectType({
        implements: () => [DocumentInterface],
    })
    class BrevoEmailCampaign implements EmailCampaignInterface, DocumentInterface {
        [OptionalProps]?: "createdAt" | "updatedAt";

        @PrimaryKey({ columnType: "uuid" })
        @Field(() => ID)
        id: string = uuid();

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

        @Property({ columnType: "text" })
        @Field()
        title: string;

        @Property({ columnType: "text" })
        @Field()
        subject: string;

        @Property({ columnType: "int", nullable: true })
        @Field(() => Int, { nullable: true })
        brevoId?: number;

        @Enum(() => SendingState)
        sendingState: SendingState;

        @Property({ columnType: "timestamp with time zone", nullable: true })
        @Field(() => Date, { nullable: true })
        scheduledAt?: Date;

        @ManyToMany(() => BrevoTargetGroup, (brevoTargetGroup) => brevoTargetGroup.campaigns, { owner: true })
        @Field(() => [BrevoTargetGroup])
        targetGroups = new Collection<TargetGroupInterface>(this);

        @RootBlock(EmailCampaignContentBlock)
        @Property({ type: new RootBlockType(EmailCampaignContentBlock) })
        @Field(() => RootBlockDataScalar(EmailCampaignContentBlock))
        content: BlockDataInterface;

        @Embedded(() => Scope)
        @Field(() => Scope)
        scope: typeof Scope;
    }

    return BrevoEmailCampaign;
}
