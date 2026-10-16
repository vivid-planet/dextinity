import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property, Ref, types } from "@mikro-orm/postgresql";
import { Field, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { Product } from "./product.entity";
import { ProductTag } from "./product-tag.entity";

@Entity()
@ObjectType()
export class ProductToTag extends BaseEntity {
    @Field()
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @ManyToOne(() => Product, { deleteRule: "cascade", ref: true })
    product: Ref<Product>;

    @ManyToOne(() => ProductTag, { deleteRule: "cascade", ref: true })
    tag: Ref<ProductTag>;

    @Field()
    @Property({ type: types.boolean })
    exampleStatus: boolean = true;
}
