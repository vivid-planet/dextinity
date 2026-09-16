import { Type } from "@nestjs/common";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { IsString, ValidateNested } from "class-validator";

import { IsUndefinable } from "../../../common/validators/is-undefinable";
import { ImageCropAreaInput } from "../../images/dto/image-crop-area.input";
import { DamScopeInterface } from "../../types";

export interface FindCopiesOfFileInScopeArgsInterface {
    id: string;
    scope: DamScopeInterface;
    imageCropArea?: ImageCropAreaInput;
}

export function createFindCopiesOfFileInScopeArgs({ Scope, hasNonEmptyScope }: { Scope: Type<DamScopeInterface>; hasNonEmptyScope: boolean }): Type {
    @ArgsType()
    class FindCopiesOfFileInScopeArgs {
        @Field(() => ID)
        @IsString()
        id: string;

        @Field(() => Scope, { defaultValue: hasNonEmptyScope ? undefined : {} })
        @ValidateNested()
        scope: DamScopeInterface;

        @Field(() => ImageCropAreaInput, { nullable: true })
        @ValidateNested()
        @IsUndefinable()
        imageCropArea?: ImageCropAreaInput;
    }

    return FindCopiesOfFileInScopeArgs;
}
