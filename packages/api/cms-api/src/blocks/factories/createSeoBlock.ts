import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsJSON, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";

import { PixelImageBlock } from "../../dam/blocks/pixel-image.block";
import {
    Block,
    BlockData,
    BlockDataInterface,
    BlockInput,
    BlockInputInterface,
    blockInputToData,
    BlockMetaField,
    BlockMetaFieldKind,
    BlockWarning,
    createBlock,
    ExtractBlockInput,
    SimpleBlockInputInterface,
    TraversableTransformBlockResponse,
} from "../block";
import { ChildBlock } from "../decorators/child-block";
import { ChildBlockInput } from "../decorators/child-block-input";
import { AnnotationBlockMeta, BlockField } from "../decorators/field";
import { createOptionalBlock, OptionalBlockInputInterface } from "./createOptionalBlock";

export enum SitemapPagePriority {
    _0_0 = "0_0",
    _0_1 = "0_1",
    _0_2 = "0_2",
    _0_3 = "0_3",
    _0_4 = "0_4",
    _0_5 = "0_5",
    _0_6 = "0_6",
    _0_7 = "0_7",
    _0_8 = "0_8",
    _0_9 = "0_9",
    _1_0 = "1_0",
}

export enum SitemapPageChangeFrequency {
    always = "always",
    hourly = "hourly",
    daily = "daily",
    weekly = "weekly",
    monthly = "monthly",
    yearly = "yearly",
    never = "never",
}

interface CreateSeoBlockOptions<ImageBlock extends Block> {
    image?: ImageBlock;
}

export interface SeoBlockInputInterface<ImageBlockInput extends BlockInputInterface> extends SimpleBlockInputInterface {
    htmlTitle?: string | null;
    metaDescription?: string | null;
    openGraphTitle?: string | null;
    openGraphDescription?: string | null;
    openGraphImage: OptionalBlockInputInterface<ImageBlockInput>;
    structuredData?: string | null;
    noIndex: boolean;
    priority: SitemapPagePriority;
    changeFrequency: SitemapPageChangeFrequency;
    canonicalUrl?: string | null;
    alternativeLinks: AlternativeLink[];
}

export function createSeoBlock<ImageBlock extends Block = typeof PixelImageBlock>(
    options: CreateSeoBlockOptions<ImageBlock> = {},
): Block<BlockDataInterface, SeoBlockInputInterface<ExtractBlockInput<ImageBlock>>> {
    const image = options.image || PixelImageBlock;

    const OptionalImageBlock = createOptionalBlock(image);

    class SeoBlockData extends BlockData {
        @BlockField({ type: "string", nullable: true })
        htmlTitle?: string | null;

        // Meta
        @BlockField({ type: "string", nullable: true })
        metaDescription?: string | null;

        // Open Graph
        @BlockField({ type: "string", nullable: true })
        openGraphTitle?: string | null;

        @BlockField({ type: "string", nullable: true })
        openGraphDescription?: string | null;

        @ChildBlock(OptionalImageBlock)
        openGraphImage: BlockDataInterface;

        //Structured Data
        @BlockField({ type: "string", nullable: true })
        structuredData?: string | null;

        // Sitemap
        @BlockField()
        noIndex: boolean;

        @BlockField({
            type: "enum",
            enum: SitemapPagePriority,
        })
        priority: SitemapPagePriority;

        @BlockField({
            type: "enum",
            enum: SitemapPageChangeFrequency,
        })
        changeFrequency: SitemapPageChangeFrequency;

        //Canonical Tag
        @BlockField({ type: "string", nullable: true })
        canonicalUrl?: string | null;

        //Alternate Hreflang
        alternativeLinks: AlternativeLink[] = [];

        async transformToPlain(): Promise<TraversableTransformBlockResponse> {
            return {
                htmlTitle: this.htmlTitle,
                metaDescription: this.metaDescription,

                openGraphTitle: this.openGraphTitle,
                openGraphDescription: this.openGraphDescription,
                openGraphImage: this.openGraphImage,

                structuredData: this.structuredData,

                noIndex: this.noIndex,
                priority: this.priority,
                changeFrequency: this.changeFrequency,

                canonicalUrl: this.canonicalUrl,

                alternativeLinks: this.alternativeLinks,
            };
        }

        warnings(): BlockWarning[] {
            if (!this.htmlTitle || !this.metaDescription) {
                return [{ severity: "low", message: "missingSeoMetadata" }];
            }
            return [];
        }
    }

    class SeoBlockInput extends BlockInput {
        @IsString()
        @IsOptional()
        @BlockField({ type: "string", nullable: true })
        htmlTitle?: string | null;

        // Meta
        @IsString()
        @IsOptional()
        @BlockField({ type: "string", nullable: true })
        metaDescription?: string | null;

        // Open Graph
        @IsString()
        @IsOptional()
        @BlockField({ type: "string", nullable: true })
        openGraphTitle?: string | null;

        @IsString()
        @IsOptional()
        @BlockField({ type: "string", nullable: true })
        openGraphDescription?: string | null;

        @ChildBlockInput(OptionalImageBlock)
        openGraphImage: OptionalBlockInputInterface<ExtractBlockInput<ImageBlock>>;

        //Structured Data
        @IsJSON()
        @IsOptional()
        @BlockField({ type: "string", nullable: true })
        structuredData?: string | null;

        // Sitemap
        @IsBoolean()
        @BlockField()
        noIndex: boolean;

        @IsEnum(SitemapPagePriority)
        @BlockField({ type: "enum", enum: SitemapPagePriority })
        priority: SitemapPagePriority;

        @IsEnum(SitemapPageChangeFrequency)
        @BlockField({ type: "enum", enum: SitemapPageChangeFrequency })
        changeFrequency: SitemapPageChangeFrequency;

        //Canonical Tag
        @IsUrl()
        @IsOptional()
        @BlockField({ type: "string", nullable: true })
        canonicalUrl?: string | null;

        //Alternate Hreflang
        @Type(() => AlternativeLink)
        @ValidateNested({ each: true })
        alternativeLinks: AlternativeLink[] = [];

        transformToBlockData(): SeoBlockData {
            return blockInputToData(SeoBlockData, this);
        }
    }

    return createBlock(SeoBlockData, SeoBlockInput, {
        name: "Seo",
        description:
            "The metadata of a page for search engines and social networks: title, description, preview image, sitemap settings and canonical URL.",
        blockMeta: new Meta(SeoBlockData),
        blockInputMeta: new InputMeta(SeoBlockData),
    });
}

class AlternativeLink {
    [key: string]: string | null | undefined;

    @IsString()
    @IsOptional()
    code?: string | null;

    @IsString()
    @IsOptional()
    @IsUrl()
    url?: string | null;
}

const alternativeLinksField: BlockMetaField = {
    name: "alternativeLinks",
    kind: BlockMetaFieldKind.NestedObjectList,
    object: {
        fields: [
            {
                name: "code",
                kind: BlockMetaFieldKind.String,
                nullable: true,
            },
            {
                name: "url",
                kind: BlockMetaFieldKind.String,
                nullable: true,
            },
        ],
    },
    nullable: false,
};

class Meta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        return [...super.fields, alternativeLinksField];
    }
}

class InputMeta extends AnnotationBlockMeta {
    get fields(): BlockMetaField[] {
        return [...super.fields, alternativeLinksField];
    }
}
