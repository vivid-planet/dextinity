import { ActionLogs, RequiredPermission } from "@dextinity/cms-api";
import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, OptionalProps, type Ref } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Min } from "class-validator";
import { randomUUID } from "crypto";

import { Product } from "./product.entity.js";
import { ProductCategoryType } from "./product-category-type.entity.js";

@RequiredPermission("products", { skipScopeCheck: true })
@ObjectType()
@Entity()
@ActionLogs()
export class ProductCategory extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @Property()
    @Field()
    title: string;

    @Property({ unique: true })
    @Field()
    slug: string;

    @Property({ columnType: "integer" })
    @Field(() => Int)
    @Min(1)
    position: number;

    @OneToMany(() => Product, (products) => products.category)
    products = new Collection<Product>(this);

    @ManyToOne(() => ProductCategoryType, { nullable: true, ref: true })
    type?: Ref<ProductCategoryType> = undefined;

    @Property()
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
