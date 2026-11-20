import { type BlockInputInterface, isBlockInputInterface, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { FooterContentBlock } from "@src/footer/blocks/footer-content.block.js";
import { Transform } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";

@InputType()
export class FooterInput {
    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(FooterContentBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : FooterContentBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;
}
