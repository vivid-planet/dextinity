import { CrudGenerator } from "@dextinity/cms-api";
import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, OptionalProps, type Ref } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { Product } from "./product.entity.js";

@ObjectType()
@Entity()
@CrudGenerator({ requiredPermission: ["products"], paging: false })
export class ProductHighlight extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @Property({ type: "text" })
    @Field()
    description: string;

    @ManyToOne(() => Product, { ref: true })
    product: Ref<Product>;

    @Property()
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
