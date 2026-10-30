import { type BlockInputInterface, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { RichTextBlock } from "@src/common/blocks/rich-text.block.js";
import { Transform } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class MainMenuItemInput {
    @Field(() => RootBlockInputScalar(RichTextBlock), { nullable: true })
    @IsOptional()
    @Transform(({ value }) => RichTextBlock.blockInputFactory(value), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface | null;
}
