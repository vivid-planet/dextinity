import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

import { IsSlug } from "../../common/validators/is-slug.js";
import { IsUndefinable } from "../../common/validators/is-undefinable.js";
import { PageTreeNodeVisibility } from "../types.js";
import { AttachedDocumentInput } from "./attached-document.input.js";

@InputType()
export abstract class PageTreeNodeBaseCreateInput {
    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsUUID()
    id?: string;

    @Field()
    @IsString()
    name: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    parentId?: string;

    @Field(() => Int, { nullable: true })
    @IsNumber()
    @IsOptional()
    pos?: number;

    @Field()
    @IsSlug()
    slug: string;

    @Field(() => AttachedDocumentInput)
    @Type(() => AttachedDocumentInput)
    @ValidateNested()
    attachedDocument: AttachedDocumentInput;

    @Field({ nullable: true })
    @IsBoolean()
    @IsOptional()
    hideInMenu?: boolean;
}

@InputType("PageTreeNodeCreateInput")
export class DefaultPageTreeNodeCreateInput extends PageTreeNodeBaseCreateInput {}

@InputType()
export abstract class PageTreeNodeBaseUpdateInput {
    @Field()
    @IsString()
    name: string;

    @Field()
    @IsSlug()
    slug: string;

    @Field(() => AttachedDocumentInput, { nullable: true })
    @Type(() => AttachedDocumentInput)
    @IsUndefinable()
    @ValidateNested()
    attachedDocument?: AttachedDocumentInput;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    hideInMenu?: boolean;

    @Field({ nullable: true, defaultValue: true })
    @IsOptional()
    @IsBoolean()
    createAutomaticRedirectsOnSlugChange: boolean;
}

@InputType("PageTreeNodeUpdateInput")
export class DefaultPageTreeNodeUpdateInput extends PageTreeNodeBaseUpdateInput {}

@InputType()
export class PageTreeNodeUpdateVisibilityInput {
    @Field(() => PageTreeNodeVisibility)
    @IsEnum(PageTreeNodeVisibility)
    visibility: PageTreeNodeVisibility;
}

@InputType()
export class MovePageTreeNodesByPosInput {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsUUID()
    parentId: string | null;

    @Field(() => Int)
    @IsInt()
    pos: number;
}

@InputType()
export class MovePageTreeNodesByNeighbourInput {
    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsUUID()
    parentId: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsUUID()
    afterId: string | null;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsUUID()
    beforeId: string | null;
}
