import { Entity, ManyToMany, OneToMany, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, OptionalProps } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { Product } from "./product.entity.js";
import { ProductToTag } from "./product-to-tag.entity.js";

@ObjectType()
@Entity()
export class ProductTag extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @Property()
    @Field()
    title: string;

    @ManyToMany(() => Product, (products) => products.tags)
    products = new Collection<Product>(this);

    @OneToMany(() => ProductToTag, (productToTag) => productToTag.tag, { orphanRemoval: true })
    productsWithStatus = new Collection<ProductToTag>(this);

    @Property()
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
