import { CrudField, CrudGenerator } from "@dextinity/cms-api";
import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, OptionalProps, Ref } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Min } from "class-validator";
import { v4 as uuid } from "uuid";

import { Product } from "./product.entity";
import { ProductCategoryType } from "./product-category-type.entity";

@ObjectType()
@Entity()
@CrudGenerator({ requiredPermission: ["products"] })
export class ProductCategory extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

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

    @CrudField({
        resolveField: true, //default is true
        //search: true, //not implemented
        //filter: true, //not implemented
        //sort: true, //not implemented
        input: true, //default is true
    })
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
