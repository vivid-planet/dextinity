import {
    ActionLogs,
    BlockDataInterface,
    CrudField,
    CrudGenerator,
    DamImageBlock,
    EntityInfo,
    FileUpload,
    ImportTargetInterface,
    InlineActionLogs,
    RequiredPermission,
    RootBlock,
    RootBlockEntity,
    RootBlockType,
} from "@comet/cms-api";
import {
    BaseEntity,
    Collection,
    Entity,
    Enum,
    FullTextType,
    Index,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    OptionalProps,
    PrimaryKey,
    Property,
    Ref,
    types,
} from "@mikro-orm/postgresql";
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { DamFile } from "@src/dam/entities/dam-file.entity";
import { Manufacturer } from "@src/products/entities/manufacturer.entity";
import { IsNumber } from "class-validator";
import { GraphQLLocalDate } from "graphql-scalars";
import { v4 as uuid } from "uuid";

import { ProductService } from "../product.service";
import { ProductCategory } from "./product-category.entity";
import { ProductColor } from "./product-color.entity";
import { ProductStatistics } from "./product-statistics.entity";
import { ProductTag } from "./product-tag.entity";
import { ProductToTag } from "./product-to-tag.entity";
import { ProductType } from "./product-type.enum";
import { ProductVariant } from "./product-variant.entity";

export enum ProductStatus {
    Published = "Published",
    Unpublished = "Unpublished",
    Deleted = "Deleted",
}
registerEnumType(ProductStatus, { name: "ProductStatus" });

@ObjectType()
@InputType("ProductDiscountsInput")
export class ProductDiscounts {
    @Field()
    @IsNumber()
    quantity: number;

    @Field()
    @IsNumber()
    price: number;
}

@ObjectType()
@InputType("ProductDimensionsInput")
export class ProductDimensions {
    @Field()
    @IsNumber()
    width: number;

    @Field()
    @IsNumber()
    height: number;

    @Field()
    @IsNumber()
    depth: number;
}

@ObjectType()
@InputType("ProductPriceRangeInput")
export class ProductPriceRange {
    @Field()
    @IsNumber()
    min: number;

    @Field()
    @IsNumber()
    max: number;
}

@EntityInfo<Product>({
    name: "title",
    secondaryInformation: "manufacturer.name",
    visible: { status: { $eq: ProductStatus.Published } },
    fullText: "fullText",
})
@RequiredPermission("products", { skipScopeCheck: true })
@ObjectType()
@Entity()
@RootBlockEntity<Product>({ isVisible: (product) => product.status === ProductStatus.Published })
@CrudGenerator({ requiredPermission: ["products"], hooksService: ProductService })
@ActionLogs()
export class Product extends BaseEntity implements ImportTargetInterface {
    [OptionalProps]?: "createdAt" | "updatedAt" | "status";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property()
    @Field()
    @CrudField({
        search: true, //default is true
        filter: true, //default is true
        sort: true, //default is true
        input: true, //default is true
    })
    title: string;

    @Enum({ items: () => ProductStatus })
    @Field(() => ProductStatus)
    status: ProductStatus = ProductStatus.Unpublished;

    @Property({ unique: true })
    @Field()
    slug: string;

    @Property({ nullable: true })
    @Field({ nullable: true })
    description?: string;

    @Enum({ items: () => ProductType })
    @Field(() => ProductType)
    type: ProductType;

    @Field(() => [ProductType])
    @Enum({ items: () => ProductType, array: true })
    additionalTypes: ProductType[] = [];

    @Property({ type: types.decimal, nullable: true })
    @Field({ nullable: true })
    price?: number = undefined;

    @Property({ type: "json", nullable: true })
    @Field(() => ProductPriceRange, { nullable: true })
    priceRange?: ProductPriceRange = undefined;

    @Property({ type: types.boolean })
    @Field()
    inStock: boolean = true;

    @Property({ type: types.integer, nullable: true })
    @Field(() => Int, { nullable: true })
    @CrudField({
        input: false,
    })
    soldCount?: number;

    @Property({ type: types.date, nullable: true })
    @Field(() => GraphQLLocalDate, { nullable: true })
    availableSince?: string = undefined;

    @Property({ nullable: true })
    @Field({ nullable: true })
    lastCheckedAt?: Date = undefined;

    @Property({ type: new RootBlockType(DamImageBlock) })
    @RootBlock(DamImageBlock)
    image: BlockDataInterface;

    @Property({ type: "json" })
    @Field(() => [ProductDiscounts])
    discounts?: ProductDiscounts[] = [];

    @Property({ type: "json" })
    @Field(() => [String])
    articleNumbers?: string[] = [];

    @Property({ type: "json", nullable: true })
    @Field(() => ProductDimensions, { nullable: true })
    dimensions?: ProductDimensions = undefined;

    @OneToOne(() => ProductStatistics, { inversedBy: "product", owner: true, ref: true, nullable: true })
    @Field(() => ProductStatistics, { nullable: true })
    statistics?: Ref<ProductStatistics> = undefined;

    @OneToMany(() => ProductColor, (variant) => variant.product, { orphanRemoval: true })
    @CrudField({
        resolveField: true, //default is true
        //search: true, //not yet implemented
        //filter: true, //not yet implemented
        //sort: true, //not yet implemented
        input: true, //default is true
    })
    @InlineActionLogs()
    colors = new Collection<ProductColor>(this);

    @OneToMany(() => ProductVariant, (variant) => variant.product, { orphanRemoval: true })
    @CrudField({
        resolveField: true, //default is true
        //search: true, //not yet implemented
        //filter: true, //not yet implemented
        //sort: true, //not yet implemented
        input: false, //default is true, disabled here because it is edited using it's own crud api
    })
    variants = new Collection<ProductVariant>(this);

    @ManyToOne(() => ProductCategory, { nullable: true, ref: true })
    @CrudField({
        resolveField: true, //default is true
        search: true, //default is true
        filter: true, //default is true
        sort: true, //default is true
        input: true, //default is true
    })
    category?: Ref<ProductCategory> = undefined;

    @ManyToMany(() => ProductTag, "products", { owner: true })
    @CrudField({
        resolveField: true, //default is true
        //search: true, //not yet implemented
        //filter: true, //not yet implemented
        //sort: true, //not yet implemented
        input: true, //default is true
    })
    tags = new Collection<ProductTag>(this);

    @OneToMany(() => ProductToTag, (productToTag) => productToTag.product, { orphanRemoval: true })
    tagsWithStatus = new Collection<ProductToTag>(this);

    @Property()
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();

    @ManyToOne(() => Manufacturer, { nullable: true, index: true, ref: true })
    manufacturer?: Ref<Manufacturer> = undefined;

    @ManyToOne(() => FileUpload, { nullable: true, ref: true })
    @Field(() => FileUpload, { nullable: true })
    priceList?: Ref<FileUpload> = undefined;

    @ManyToMany(() => FileUpload)
    @Field(() => [FileUpload])
    datasheets = new Collection<FileUpload>(this);

    @ManyToMany(() => DamFile)
    @Field(() => [DamFile])
    relatedImages = new Collection<DamFile>(this);

    @Index({ type: "fulltext" })
    @Property<Product>({
        nullable: true,
        type: new FullTextType(),
        onCreate: (product) => {
            return {
                A: product.title,
                D: product.description,
            };
        },
        onUpdate: (product) => {
            return {
                A: product.title,
                D: product.description,
            };
        },
    })
    fullText?: string;
}
