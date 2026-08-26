import { CrudField, DocumentInterface } from "@dextinity/cms-api";
import { BaseEntity, Entity, ManyToOne, OptionalProps, PrimaryKey, Property, Ref } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { Product } from "./product.entity";

@ObjectType({
    implements: () => [DocumentInterface],
})
@Entity()
export class ProductColor extends BaseEntity implements DocumentInterface {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property()
    @Field()
    name: string;

    @Property()
    @Field()
    hexCode: string;

    @ManyToOne(() => Product, { ref: true })
    @CrudField({
        resolveField: true, // default is true
        // search: true, // not yet supported for nested
        // filter: true, // not yet supported for nested
        // sort: true, // not yet supported for nested
        // input: true, // not supported for nested, doesn't make sense
    })
    product: Ref<Product>;

    @Property()
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
