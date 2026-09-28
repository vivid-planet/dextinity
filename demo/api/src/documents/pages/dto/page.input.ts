import { BlockInputInterface, RootBlockInputScalar } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { ValidateNested } from "class-validator";

import { PageContentBlock } from "../blocks/page-content.block";
import { SeoBlock } from "../blocks/seo.block";
import { StageBlock } from "../blocks/stage.block";

@InputType()
export class PageInput {
    @Field(() => RootBlockInputScalar(PageContentBlock))
    @Transform(({ value }) => PageContentBlock.blockInputFactory(value), { toClassOnly: true })
    @ValidateNested()
    content: BlockInputInterface;

    @Field(() => RootBlockInputScalar(SeoBlock))
    @Transform(({ value }) => SeoBlock.blockInputFactory(value), { toClassOnly: true })
    @ValidateNested()
    seo: BlockInputInterface;

    @Field(() => RootBlockInputScalar(StageBlock))
    @Transform(({ value }) => StageBlock.blockInputFactory(value), { toClassOnly: true })
    @ValidateNested()
    stage: BlockInputInterface;
}
