import { CrudGenerator } from "@dextinity/cms-api";
import { Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { ProductCategory } from "./product-category.entity.js";

@ObjectType()
@Entity()
@CrudGenerator({ requiredPermission: ["products"] })
export class ProductCategoryType extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @Property()
    @Field()
    title: string;

    @OneToMany(() => ProductCategory, (productCategory) => productCategory.type)
    categories = new Collection<ProductCategory>(this);
}
