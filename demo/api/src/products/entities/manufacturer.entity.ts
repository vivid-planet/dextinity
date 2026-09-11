import { CrudGenerator, EntityInfo, IsNullable, IsUndefinable, RequiredPermission } from "@dextinity/cms-api";
import {
    BaseEntity,
    Embeddable,
    Embedded,
    Entity,
    Enum,
    FullTextType,
    Index,
    IType,
    OptionalProps,
    PrimaryKey,
    Property,
} from "@mikro-orm/postgresql";
import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsObject, IsString } from "class-validator";
import { v4 as uuid } from "uuid";

import { Coordinates, CoordinatesType } from "../coordinates.type";
import { ProductType } from "./product-type.enum";

@ObjectType()
@InputType("AlternativeAddressInput")
class AlternativeAddress {
    @Field()
    @Property()
    @IsString()
    street: string;

    @Field({ nullable: true })
    @Property({ nullable: true })
    @IsNumber()
    @IsNullable()
    streetNumber?: number = undefined;

    @Field()
    @Property()
    @IsString()
    zip: string;

    @Field()
    @Property()
    @IsString()
    country: string;
}

@ObjectType()
@InputType("AddressInput")
export class Address extends AlternativeAddress {
    @IsNullable()
    @Property({ type: "json", nullable: true })
    @Field(() => AlternativeAddress, { nullable: true })
    @IsObject()
    @IsUndefinable()
    alternativeAddress?: AlternativeAddress = undefined;
}

@Embeddable()
@ObjectType()
@InputType("AlternativeAddressAsEmbeddableInput")
class AlternativeAddressAsEmbeddable {
    @Field()
    @Property()
    @IsString()
    street: string;

    @Field({ nullable: true })
    @Property({ nullable: true })
    @IsNumber()
    @IsNullable()
    streetNumber?: number = undefined;

    @Field()
    @Property()
    @IsString()
    zip: string;

    @Field()
    @Property()
    @IsString()
    country: string;
}

@Embeddable()
@ObjectType()
@InputType("AddressAsEmbeddableInput")
export class AddressAsEmbeddable extends AlternativeAddressAsEmbeddable {
    @Embedded(() => AlternativeAddressAsEmbeddable)
    @Field(() => AlternativeAddressAsEmbeddable)
    @IsObject()
    alternativeAddress: AlternativeAddressAsEmbeddable;
}

@EntityInfo<Manufacturer>({
    name: "name",
    fullText: "fullText",
})
@RequiredPermission("manufacturers", { skipScopeCheck: true })
@Entity()
@ObjectType()
@CrudGenerator({ requiredPermission: ["manufacturers"] })
export class Manufacturer extends BaseEntity {
    [OptionalProps]?: "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property()
    @Field()
    name: string;

    @Property({ type: "json", nullable: true })
    @Field(() => Address, { nullable: true })
    address?: Address = undefined;

    @Embedded(() => AddressAsEmbeddable) // Embedded can only be optional if all contained properties are optional
    @Field(() => AddressAsEmbeddable)
    addressAsEmbeddable: AddressAsEmbeddable;

    @Property({ type: CoordinatesType, nullable: true })
    @Field(() => Coordinates, { nullable: true })
    coordinates?: IType<Coordinates, string>;

    @Enum({ items: () => ProductType, nullable: true })
    @Field(() => ProductType, { nullable: true })
    productType?: ProductType;

    @Property({ onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();

    @Index({ type: "fulltext" })
    @Property<Manufacturer>({
        nullable: true,
        type: new FullTextType(),
        onCreate: (manufacturer) => {
            return {
                A: manufacturer.name,
            };
        },
        onUpdate: (manufacturer) => {
            return {
                A: manufacturer.name,
            };
        },
    })
    fullText?: string;
}
