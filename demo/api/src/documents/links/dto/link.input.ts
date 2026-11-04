import { BlockInputInterface, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { LinkBlock } from "@src/common/blocks/link.block";
import { Transform } from "class-transformer";
import { ValidateNested } from "class-validator";

@InputType()
export class LinkInput {
    @Field(() => RootBlockInputScalar(LinkBlock))
    @Transform(({ value }) => LinkBlock.blockInputFactory(value), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;
}
