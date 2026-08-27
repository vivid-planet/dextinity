import { CrudGenerator } from "@dextinity/cms-api";
import { BaseEntity, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { ProductCategory } from "./product-category.entity";

@ObjectType()
@Entity()
@CrudGenerator({ requiredPermission: ["products"] })
export class ProductCategoryType extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property()
    @Field()
    title: string;

    @OneToMany(() => ProductCategory, (productCategory) => productCategory.type)
    categories = new Collection<ProductCategory>(this);
}
