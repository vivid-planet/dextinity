import { DamImageBlock } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { Manufacturer } from "@src/products/entities/manufacturer.entity";
import { Product, ProductStatus } from "@src/products/entities/product.entity";
import { ProductCategory } from "@src/products/entities/product-category.entity";
import { ProductCategoryType } from "@src/products/entities/product-category-type.entity";
import { ProductType } from "@src/products/entities/product-type.enum";
import { format } from "date-fns";

@Injectable()
export class ProductsFixtureService {
    private logger = new Logger(ProductsFixtureService.name);

    constructor(private readonly entityManager: EntityManager) {}

    async generate(): Promise<void> {
        this.logger.log("Generating manufacturers...");

        const manufacturers: Manufacturer[] = [];

        for (let i = 0; i < 10; i++) {
            const manufacturer = this.entityManager.create(Manufacturer, {
                id: faker.string.uuid(),
                name: faker.company.name(),
                address: {
                    street: faker.location.street(),
                    streetNumber: Number(faker.location.buildingNumber()),
                    zip: faker.location.zipCode("####"),
                    country: faker.location.country(),
                    alternativeAddress: {
                        street: faker.location.street(),
                        streetNumber: Number(faker.location.buildingNumber()),
                        zip: faker.location.zipCode("####"),
                        country: faker.location.country(),
                    },
                },
                addressAsEmbeddable: {
                    street: faker.location.street(),
                    streetNumber: Number(faker.location.buildingNumber()),
                    zip: faker.location.zipCode("####"),
                    country: faker.location.country(),
                    alternativeAddress: {
                        street: faker.location.street(),
                        streetNumber: Number(faker.location.buildingNumber()),
                        zip: faker.location.zipCode("####"),
                        country: faker.location.country(),
                    },
                },
            });

            this.entityManager.persist(manufacturer);

            manufacturers.push(manufacturer);
        }

        this.logger.log("Generating product category types...");
        const productCategoryTypes: ProductCategoryType[] = [];
        for (let i = 0; i < 5; i++) {
            const title = faker.commerce.productName();
            const productCategoryType = this.entityManager.create(ProductCategoryType, {
                id: faker.string.uuid(),
                title: title,
            });
            this.entityManager.persist(productCategoryType);
            productCategoryTypes.push(productCategoryType);
        }

        const usedSlugs = new Set<string>();

        this.logger.log("Generating product categories...");
        const productCategories: ProductCategory[] = [];
        for (let i = 0; i < 10; i++) {
            const title = faker.commerce.productName();
            const productCategory = this.entityManager.create(ProductCategory, {
                id: faker.string.uuid(),
                title: title,
                type: faker.helpers.arrayElement(productCategoryTypes),
                slug: this.generateUniqueSlug(title, usedSlugs),
                position: i + 1,
            });
            this.entityManager.persist(productCategory);
            productCategories.push(productCategory);
        }

        this.logger.log("Generating products...");
        for (let i = 0; i < 100; i++) {
            const title = faker.commerce.productName();

            const product = this.entityManager.create(Product, {
                id: faker.string.uuid(),
                title: faker.commerce.productName(),
                status: faker.helpers.arrayElement([ProductStatus.Published, ProductStatus.Unpublished]),
                slug: this.generateUniqueSlug(title, usedSlugs),
                description: faker.commerce.productDescription(),
                type: faker.helpers.arrayElement([ProductType.cap, ProductType.shirt, ProductType.tie]),
                category: faker.helpers.arrayElement(productCategories),
                additionalTypes: [],
                price: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
                inStock: faker.datatype.boolean(),
                soldCount: faker.number.int({ min: 0, max: 100 }),
                availableSince: format(faker.date.past(), "yyyy-MM-dd"),
                image: DamImageBlock.blockInputFactory({
                    attachedBlocks: [{ type: "pixelImage", props: {} }],
                    activeType: "pixelImage",
                }).transformToBlockData(),
                manufacturer: faker.helpers.arrayElement(manufacturers),
            });

            this.entityManager.persist(product);
        }
    }

    private generateUniqueSlug(title: string, usedSlugs: Set<string>): string {
        const baseSlug = faker.helpers.slugify(title);

        if (!usedSlugs.has(baseSlug)) {
            usedSlugs.add(baseSlug);
            return baseSlug;
        }

        let suffix = 2;
        let candidateSlug = `${baseSlug}-${suffix}`;
        while (usedSlugs.has(candidateSlug)) {
            suffix++;
            candidateSlug = `${baseSlug}-${suffix}`;
        }

        usedSlugs.add(candidateSlug);
        return candidateSlug;
    }
}
