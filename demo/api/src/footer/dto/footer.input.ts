import { type BlockInputInterface, isBlockInputInterface, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";

import { FooterContentBlock } from "../blocks/footer-content.block.js";

@InputType()
export class FooterInput {
    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(FooterContentBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : FooterContentBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;
}
