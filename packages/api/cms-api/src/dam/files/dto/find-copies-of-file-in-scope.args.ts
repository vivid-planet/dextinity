import type { Type } from "@nestjs/common";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { IsString, ValidateNested } from "class-validator";

import { IsUndefinable } from "../../../common/validators/is-undefinable.js";
import { ImageCropAreaInput } from "../../images/dto/image-crop-area.input.js";
import type { DamScopeInterface } from "../../types.js";

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
        scope: typeof Scope;

        @Field(() => ImageCropAreaInput, { nullable: true })
        @ValidateNested()
        @IsUndefinable()
        imageCropArea?: ImageCropAreaInput;
    }

    return FindCopiesOfFileInScopeArgs;
}
