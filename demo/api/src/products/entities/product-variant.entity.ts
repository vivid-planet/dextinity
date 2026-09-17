import { BlockDataInterface, CrudField, CrudGenerator, DamImageBlock, RootBlock, RootBlockEntity, RootBlockType } from "@dextinity/cms-api";
import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, OptionalProps, Ref } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Min } from "class-validator";
import { v4 as uuid } from "uuid";

import { ProductVariantService } from "../product-variant.service";
import { Product } from "./product.entity";

@ObjectType()
@Entity()
@RootBlockEntity()
@CrudGenerator({
    requiredPermission: "products",
    position: { groupByFields: ["product"] },
    hooksService: ProductVariantService,
})
export class ProductVariant extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property()
    @Field()
    name: string;

    @Property({ type: new RootBlockType(DamImageBlock) })
    @RootBlock(DamImageBlock)
    image: BlockDataInterface;

    @Property({ columnType: "integer" })
    @Field(() => Int)
    @Min(1)
    position: number;

    @ManyToOne(() => Product, { ref: true })
    @CrudField({
        resolveField: true, // default is true
        // search: true, // not yet supported for nested
        // filter: true, // not yet supported for nested
        // sort: true, // not yet supported for nested
        // input: false, // ignored because product is a root argument for create
        dedicatedResolverArg: true, //default is false
    })
    product: Ref<Product>;

    @Property()
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
