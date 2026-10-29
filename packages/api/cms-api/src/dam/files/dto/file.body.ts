import type { Type } from "@nestjs/common";
import { plainToInstance, Transform, Type as ClassTransformerType } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";

import { ImageCropAreaInput } from "../../images/dto/image-crop-area.input.js";
import type { DamScopeInterface } from "../../types.js";
import { LicenseInput } from "./file.input.js";

export interface UploadFileBodyInterface {
    scope: DamScopeInterface;
    folderId?: string;
    title?: string;
    altText?: string;
    license?: LicenseInput;
    imageCropArea?: ImageCropAreaInput;
    importSourceId?: string;
    importSourceType?: string;
}

export function createUploadFileBody({ Scope }: { Scope: Type<DamScopeInterface> }): Type<UploadFileBodyInterface> {
    class UploadFileBody implements UploadFileBodyInterface {
        @Transform(({ value }) => plainToInstance(Scope, JSON.parse(value)))
        @ValidateNested()
        scope: DamScopeInterface;

        @IsOptional()
        @IsString()
        folderId?: string;

        @IsOptional()
        @IsString()
        title?: string;

        @IsOptional()
        @IsString()
        altText?: string;

        @Transform(({ value }) => plainToInstance(LicenseInput, JSON.parse(value)))
        @IsOptional()
        @ClassTransformerType(() => LicenseInput)
        @ValidateNested()
        license?: LicenseInput;

        @Transform(({ value }) => plainToInstance(ImageCropAreaInput, JSON.parse(value)))
        @IsOptional()
        @ClassTransformerType(() => ImageCropAreaInput)
        @ValidateNested()
        imageCropArea?: ImageCropAreaInput;

        @IsString()
        @IsNotEmpty()
        @ValidateIf((input) => input.importSourceType !== undefined)
        importSourceId?: string;

        @IsString()
        @IsNotEmpty()
        @ValidateIf((input) => input.importSourceId !== undefined)
        importSourceType?: string;
    }

    return UploadFileBody;
}

export class ReplaceFileByIdBody {
    @IsString()
    fileId: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    altText?: string;

    @Transform(({ value }) => plainToInstance(LicenseInput, JSON.parse(value)))
    @IsOptional()
    @ClassTransformerType(() => LicenseInput)
    @ValidateNested()
    license?: LicenseInput;

    @Transform(({ value }) => plainToInstance(ImageCropAreaInput, JSON.parse(value)))
    @IsOptional()
    @ClassTransformerType(() => ImageCropAreaInput)
    @ValidateNested()
    imageCropArea?: ImageCropAreaInput;

    @IsString()
    @IsNotEmpty()
    @ValidateIf((input) => input.importSourceType !== undefined)
    importSourceId?: string;

    @IsString()
    @IsNotEmpty()
    @ValidateIf((input) => input.importSourceId !== undefined)
    importSourceType?: string;
}
