import { type BlockInputInterface, DamImageBlock, isBlockInputInterface, IsSlug, PartialType, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";

import { NewsContentBlock } from "../blocks/news-content.block.js";
import { NewsCategory, NewsStatus } from "../entities/news.entity.js";

@InputType()
export class NewsInput {
    @IsNotEmpty()
    @IsString()
    @IsSlug()
    @Field()
    slug: string;
    @IsNotEmpty()
    @IsString()
    @Field()
    title: string;
    @IsNotEmpty()
    @IsEnum(NewsStatus)
    @Field(() => NewsStatus, { defaultValue: NewsStatus.active })
    status: NewsStatus;
    @IsNotEmpty()
    @IsDate()
    @Field()
    date: Date;
    @IsNotEmpty()
    @IsEnum(NewsCategory)
    @Field(() => NewsCategory)
    category: NewsCategory;
    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(DamImageBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : DamImageBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    image: BlockInputInterface;
    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(NewsContentBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : NewsContentBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;
}
@InputType()
export class NewsUpdateInput extends PartialType(NewsInput) {}
