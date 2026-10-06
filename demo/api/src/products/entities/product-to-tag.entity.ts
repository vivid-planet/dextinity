import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, type Ref, types } from "@mikro-orm/postgresql";
import { Field, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { Product } from "./product.entity.js";
import { ProductTag } from "./product-tag.entity.js";

@Entity()
@ObjectType()
export class ProductToTag extends BaseEntity {
    @Field()
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @ManyToOne(() => Product, { deleteRule: "cascade", ref: true })
    product: Ref<Product>;

    @ManyToOne(() => ProductTag, { deleteRule: "cascade", ref: true })
    tag: Ref<ProductTag>;

    @Field()
    @Property({ type: types.boolean })
    exampleStatus: boolean = true;
}
