import {
    AffectedEntity,
    BlocksTransformerService,
    CurrentUser,
    DamImageBlock,
    GetCurrentUser,
    gqlArgsToMikroOrmQuery,
    gqlSortToMikroOrmOrderBy,
    RequiredPermission,
    RootBlockDataScalar,
} from "@dextinity/cms-api";
import { EntityManager, type FindOptions, Reference } from "@mikro-orm/postgresql";
import { Args, Field, ID, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { PaginatedProductVariants } from "./dto/paginated-product-variants.js";
import { ProductVariantInput, ProductVariantUpdateInput } from "./dto/product-variant.input.js";
import { ProductVariantsArgs } from "./dto/product-variants.args.js";
import { Product } from "./entities/product.entity.js";
import { ProductVariant } from "./entities/product-variant.entity.js";
import { ProductVariantMutationError, ProductVariantService } from "./product-variant.service.js";
import { ProductVariantsService } from "./product-variants.service.js";

@ObjectType()
class CreateProductVariantPayload {
    @Field(() => ProductVariant, { nullable: true })
    productVariant?: ProductVariant;
    @Field(() => [ProductVariantMutationError], { nullable: false })
    errors: ProductVariantMutationError[];
}
@ObjectType()
class UpdateProductVariantPayload {
    @Field(() => ProductVariant, { nullable: true })
    productVariant?: ProductVariant;
    @Field(() => [ProductVariantMutationError], { nullable: false })
    errors: ProductVariantMutationError[];
}
@Resolver(() => ProductVariant)
@RequiredPermission("products", { skipScopeCheck: true })
export class ProductVariantResolver {
    constructor(
        protected readonly entityManager: EntityManager,
        protected readonly productVariantsService: ProductVariantsService,
        private readonly blocksTransformer: BlocksTransformerService,
        protected readonly productVariantService: ProductVariantService,
    ) {}
    @Query(() => ProductVariant)
    @AffectedEntity(ProductVariant)
    async productVariant(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<ProductVariant> {
        const productVariant = await this.entityManager.findOneOrFail(ProductVariant, id);
        return productVariant;
    }
    @Query(() => PaginatedProductVariants)
    @AffectedEntity(Product, { idArg: "product" })
    async productVariants(
        @Args()
        { product, search, filter, sort, offset, limit }: ProductVariantsArgs,
    ): Promise<PaginatedProductVariants> {
        const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(ProductVariant));
        where.product = product;
        const options: FindOptions<ProductVariant> = { offset, limit };
        if (sort) {
            options.orderBy = gqlSortToMikroOrmOrderBy(sort);
        }
        const [entities, totalCount] = await this.entityManager.findAndCount(ProductVariant, where, options);
        return new PaginatedProductVariants(entities, totalCount);
    }
    @Mutation(() => CreateProductVariantPayload)
    @AffectedEntity(Product, { idArg: "product" })
    async createProductVariant(
        @Args("product", { type: () => ID })
        product: string,
        @Args("input", { type: () => ProductVariantInput })
        input: ProductVariantInput,
        @GetCurrentUser()
        user: CurrentUser,
    ): Promise<CreateProductVariantPayload> {
        const errors = await this.productVariantService.validateCreateInput(input, { currentUser: user, args: { product } });
        if (errors.length > 0) {
            return { errors };
        }
        const lastPosition = await this.productVariantsService.getLastPosition({ product });
        let position = input.position;
        if (position !== undefined && position < lastPosition + 1) {
            await this.productVariantsService.incrementPositions({ product }, position);
        } else {
            position = lastPosition + 1;
        }
        const { image: imageInput, ...assignInput } = input;
        const productVariant = this.entityManager.create(ProductVariant, {
            ...assignInput,
            position,
            product: Reference.create(await this.entityManager.findOneOrFail(Product, product)),
            image: imageInput.transformToBlockData(),
        });
        await this.entityManager.flush();
        return { productVariant, errors: [] };
    }
    @Mutation(() => UpdateProductVariantPayload)
    @AffectedEntity(ProductVariant)
    async updateProductVariant(
        @Args("id", { type: () => ID })
        id: string,
        @Args("input", { type: () => ProductVariantUpdateInput })
        input: ProductVariantUpdateInput,
        @GetCurrentUser()
        user: CurrentUser,
    ): Promise<UpdateProductVariantPayload> {
        const productVariant = await this.entityManager.findOneOrFail(ProductVariant, id);
        const errors = await this.productVariantService.validateUpdateInput(input, { currentUser: user, entity: productVariant });
        if (errors.length > 0) {
            return { errors };
        }
        if (input.position !== undefined) {
            const lastPosition = await this.productVariantsService.getLastPosition({ product: productVariant.product.id });
            if (input.position > lastPosition) {
                input.position = lastPosition;
            }
            if (productVariant.position < input.position) {
                await this.productVariantsService.decrementPositions({ product: productVariant.product.id }, productVariant.position, input.position);
            } else if (productVariant.position > input.position) {
                await this.productVariantsService.incrementPositions({ product: productVariant.product.id }, input.position, productVariant.position);
            }
        }
        const { image: imageInput, ...assignInput } = input;
        productVariant.assign({
            ...assignInput,
        });
        if (imageInput) {
            productVariant.image = imageInput.transformToBlockData();
        }
        await this.entityManager.flush();
        return { productVariant, errors: [] };
    }
    @Mutation(() => Boolean)
    @AffectedEntity(ProductVariant)
    async deleteProductVariant(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<boolean> {
        const productVariant = await this.entityManager.findOneOrFail(ProductVariant, id);
        this.entityManager.remove(productVariant);
        await this.productVariantsService.decrementPositions({ product: productVariant.product.id }, productVariant.position);
        await this.entityManager.flush();
        return true;
    }
    @ResolveField(() => Product)
    async product(
        @Parent()
        productVariant: ProductVariant,
    ): Promise<Product> {
        return productVariant.product.loadOrFail();
    }
    @ResolveField(() => RootBlockDataScalar(DamImageBlock))
    async image(
        @Parent()
        productVariant: ProductVariant,
    ): Promise<object> {
        return this.blocksTransformer.transformToPlain(productVariant.image);
    }
}
