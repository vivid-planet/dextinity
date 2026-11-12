import { type BlockInputInterface, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block.js";
import { Transform } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class MainMenuItemInput {
    @Field(() => RootBlockInputScalar(TipTapRichTextBlock), { nullable: true })
    @IsOptional()
    @Transform(({ value }) => TipTapRichTextBlock.blockInputFactory(value), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface | null;
}
