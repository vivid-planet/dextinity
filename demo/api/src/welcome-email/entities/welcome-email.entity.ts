import { BlockDataInterface, CrudSingleGenerator, RootBlock, RootBlockDataScalar, RootBlockEntity, RootBlockType } from "@dextinity/cms-api";
import { BaseEntity, Embedded, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { WelcomeEmailContentBlock } from "../blocks/welcome-email-content.block";
import { WelcomeEmailScope } from "../dto/welcome-email-scope";

@Entity()
@ObjectType()
@RootBlockEntity()
@CrudSingleGenerator({ requiredPermission: ["pageTree"] })
export class WelcomeEmail extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @RootBlock(WelcomeEmailContentBlock)
    @Property({ type: new RootBlockType(WelcomeEmailContentBlock) })
    @Field(() => RootBlockDataScalar(WelcomeEmailContentBlock))
    content: BlockDataInterface;

    @Embedded(() => WelcomeEmailScope)
    @Field(() => WelcomeEmailScope)
    scope: WelcomeEmailScope;

    @Property({ columnType: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ columnType: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
