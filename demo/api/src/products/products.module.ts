import { FileUpload } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@src/config/config.module.js";
import { TranslationModule } from "@src/translation/translation.module.js";

import { ProductPriceBlockTransformerService } from "./blocks/product-price-block-transformer.service.js";
import { CustomProductResolver } from "./custom-product.resolver.js";
import { Manufacturer } from "./entities/manufacturer.entity.js";
import { ManufacturerCountry } from "./entities/manufacturer-country.entity.js";
import { Product } from "./entities/product.entity.js";
import { ProductCategory } from "./entities/product-category.entity.js";
import { ProductColor } from "./entities/product-color.entity.js";
import { ProductHighlight } from "./entities/product-highlight.entity.js";
import { ProductStatistics } from "./entities/product-statistics.entity.js";
import { ProductTag } from "./entities/product-tag.entity.js";
import { ProductToTag } from "./entities/product-to-tag.entity.js";
import { ProductVariant } from "./entities/product-variant.entity.js";
import { ManufacturerResolver } from "./generated/manufacturer.resolver.js";
import { ManufacturerCountryResolver } from "./generated/manufacturer-country.resolver.js";
import { ProductResolver } from "./generated/product.resolver.js";
import { ProductCategoriesService } from "./generated/product-categories.service.js";
import { ProductCategoryResolver } from "./generated/product-category.resolver.js";
import { ProductCategoryTypeResolver } from "./generated/product-category-type.resolver.js";
import { ProductColorResolver } from "./generated/product-color.resolver.js";
import { ProductHighlightResolver } from "./generated/product-highlight.resolver.js";
import { ProductTagResolver } from "./generated/product-tag.resolver.js";
import { ProductToTagResolver } from "./generated/product-to-tag.resolver.js";
import { ProductVariantResolver } from "./generated/product-variant.resolver.js";
import { ProductVariantsService } from "./generated/product-variants.service.js";
import { ProductService } from "./product.service.js";
import { ProductImporterCommand } from "./product-importer.command.js";
import { ProductImporterService } from "./product-importer.service.js";
import { ProductVariantService } from "./product-variant.service.js";
import { ProductPublishedMail } from "./published-mail/product-published.mail.js";

@Module({
    imports: [
        MikroOrmModule.forFeature([
            Product,
            ProductCategory,
            ProductTag,
            ProductToTag,
            ProductVariant,
            ProductStatistics,
            ProductColor,
            Manufacturer,
            FileUpload,
            ManufacturerCountry,
            ProductHighlight,
        ]),
        ConfigModule,
        TranslationModule,
    ],
    providers: [
        ProductResolver,
        ProductCategoryResolver,
        ProductCategoriesService,
        ProductTagResolver,
        ProductVariantResolver,
        ProductVariantsService,
        ManufacturerResolver,
        ManufacturerCountryResolver,
        ProductToTagResolver,
        ProductImporterCommand,
        ProductImporterService,
        ProductColorResolver,
        CustomProductResolver,
        ProductHighlightResolver,
        ProductPublishedMail,
        ProductCategoryTypeResolver,
        ProductService,
        ProductVariantService,
        ProductPriceBlockTransformerService,
    ],
    exports: [],
})
export class ProductsModule {}
