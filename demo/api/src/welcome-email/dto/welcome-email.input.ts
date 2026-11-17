import { type BlockInputInterface, isBlockInputInterface, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { WelcomeEmailContentBlock } from "@src/welcome-email/blocks/welcome-email-content.block.js";
import { Transform } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";

@InputType()
export class WelcomeEmailInput {
    @IsNotEmpty()
    @Field(() => RootBlockInputScalar(WelcomeEmailContentBlock))
    @Transform(({ value }) => (isBlockInputInterface(value) ? value : WelcomeEmailContentBlock.blockInputFactory(value)), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;
}
