import { BlockDataInterface, RootBlock, RootBlockDataScalar, RootBlockEntity, RootBlockType } from "@dextinity/cms-api";
import { BaseEntity, Entity, OneToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity";
import { v4 as uuid } from "uuid";

@Entity()
@ObjectType()
@RootBlockEntity()
export class MainMenuItem extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ columnType: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @OneToOne({ joinColumn: "nodeId", deleteRule: "CASCADE" })
    @Field(() => PageTreeNode)
    node: PageTreeNode;

    @Property({ type: new RootBlockType(RichTextBlock), nullable: true })
    @RootBlock(RichTextBlock)
    @Field(() => RootBlockDataScalar(RichTextBlock), { nullable: true })
    content: BlockDataInterface | null;

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
}
