import { type BlockInputInterface, DamImageBlock, isBlockInputInterface, PartialType, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType, Int } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";

@InputType()
export class ProductVariantInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    name: string;
    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(DamImageBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : DamImageBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    image: BlockInputInterface;
    @IsOptional()
    @Min(1)
    @IsInt()
    @Field(() => Int, { nullable: true })
    position?: number;
}
@InputType()
export class ProductVariantUpdateInput extends PartialType(ProductVariantInput) {}
