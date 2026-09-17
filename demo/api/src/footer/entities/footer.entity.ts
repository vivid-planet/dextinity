import { BlockDataInterface, CrudSingleGenerator, RootBlock, RootBlockDataScalar, RootBlockEntity, RootBlockType } from "@dextinity/cms-api";
import { Embedded, Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, OptionalProps } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { FooterContentBlock } from "../blocks/footer-content.block";
import { FooterScope } from "../dto/footer-scope";

@Entity()
@ObjectType()
@RootBlockEntity()
@CrudSingleGenerator({ requiredPermission: ["pageTree"] })
export class Footer extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @RootBlock(FooterContentBlock)
    @Property({ type: new RootBlockType(FooterContentBlock) })
    @Field(() => RootBlockDataScalar(FooterContentBlock))
    content: BlockDataInterface;

    @Embedded(() => FooterScope)
    @Field(() => FooterScope)
    scope: FooterScope;

    @Property({ columnType: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ columnType: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
