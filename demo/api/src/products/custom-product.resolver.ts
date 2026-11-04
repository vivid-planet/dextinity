import { MailerService, RequiredPermission } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Mutation, Resolver } from "@nestjs/graphql";

import { Product, ProductStatus } from "./entities/product.entity";
import { ProductPublishedMail } from "./published-mail/product-published.mail";

@Resolver(() => Product)
@RequiredPermission(["products"], { skipScopeCheck: true })
export class CustomProductResolver {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly mailerService: MailerService,
        private readonly productPublishedMail: ProductPublishedMail,
    ) {}

    @Mutation(() => Boolean)
    async publishAllProducts(): Promise<boolean> {
        const countProductPublished = await this.entityManager.count(Product, { status: { $ne: ProductStatus.Published } });
        await this.entityManager.nativeUpdate(Product, { status: { $ne: ProductStatus.Published } }, { status: ProductStatus.Published });

        await this.mailerService.sendMail({
            ...(await this.productPublishedMail.generateMail({
                recipient: { name: "Product Manager", email: "product-manager@dextinity.com", language: "en" },
                countProductPublished: countProductPublished,
            })),
        });
        return true;
    }
}
