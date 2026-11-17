import { type BlockInputInterface, isBlockInputInterface, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";

import { WelcomeEmailContentBlock } from "../blocks/welcome-email-content.block.js";

@InputType()
export class WelcomeEmailInput {
    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(WelcomeEmailContentBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : WelcomeEmailContentBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;
}
