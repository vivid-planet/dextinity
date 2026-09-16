import { Type } from "@nestjs/common";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { IsString, ValidateNested } from "class-validator";

import { IsUndefinable } from "../../../common/validators/is-undefinable";
import { ScopeInterface } from "../../../user-permissions/interfaces/scope.interface";
import { ImageCropAreaInput } from "../../images/dto/image-crop-area.input";

export interface FindCopiesOfFileInScopeArgsInterface {
    id: string;
    scope: ScopeInterface;
    imageCropArea?: ImageCropAreaInput;
}

export function createFindCopiesOfFileInScopeArgs({ Scope, hasNonEmptyScope }: { Scope: Type<ScopeInterface>; hasNonEmptyScope: boolean }): Type {
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
