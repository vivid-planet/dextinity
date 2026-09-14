import {
    BlockDataInterface,
    blockToMikroOrmFullText,
    DocumentInterface,
    PageTreeNodeDocumentEntityScopeService,
    RootBlock,
    RootBlockDataScalar,
    RootBlockEntity,
    RootBlockType,
    ScopedEntity,
} from "@dextinity/cms-api";
import { BaseEntity, Entity, FullTextType, Index, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { PageContentBlock } from "../blocks/page-content.block";
import { SeoBlock } from "../blocks/seo.block";
import { StageBlock } from "../blocks/stage.block";

@Entity()
@ObjectType({
    implements: () => [DocumentInterface],
})
@RootBlockEntity()
@ScopedEntity(PageTreeNodeDocumentEntityScopeService)
export class Page extends BaseEntity implements DocumentInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @RootBlock(PageContentBlock)
    @Property({ type: new RootBlockType(PageContentBlock) })
    @Field(() => RootBlockDataScalar(PageContentBlock))
    content: BlockDataInterface;

    @Index({ type: "fulltext" })
    @Property<Page>({
        nullable: true,
        type: new FullTextType(),
        onCreate: (page) => blockToMikroOrmFullText(page.content),
        onUpdate: (page) => blockToMikroOrmFullText(page.content),
    })
    fullTextContent?: string;

    @RootBlock(SeoBlock)
    @Property({ type: new RootBlockType(SeoBlock) })
    @Field(() => RootBlockDataScalar(SeoBlock))
    seo: BlockDataInterface;

    @Index({ type: "fulltext" })
    @Property<Page>({
        nullable: true,
        type: new FullTextType(),
        onCreate: (page) => blockToMikroOrmFullText(page.seo),
        onUpdate: (page) => blockToMikroOrmFullText(page.seo),
    })
    fullTextSeo?: string;

    @RootBlock(StageBlock)
    @Property({ type: new RootBlockType(StageBlock) })
    @Field(() => RootBlockDataScalar(StageBlock))
    stage: BlockDataInterface;

    @Index({ type: "fulltext" })
    @Property<Page>({
        nullable: true,
        type: new FullTextType(),
        onCreate: (page) => blockToMikroOrmFullText(page.stage),
        onUpdate: (page) => blockToMikroOrmFullText(page.stage),
    })
    fullTextStage?: string;

    @Property({
        type: "timestamp with time zone",
    })
    @Field()
    createdAt: Date = new Date();

    @Property({
        type: "timestamp with time zone",
        onUpdate: () => new Date(),
    })
    @Field()
    updatedAt: Date = new Date();
}
