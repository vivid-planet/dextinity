import { Type } from "@nestjs/common";
import { plainToInstance, Transform, Type as ClassTransformerType } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";

import { ScopeInterface } from "../../../user-permissions/interfaces/scope.interface";
import { ImageCropAreaInput } from "../../images/dto/image-crop-area.input";
import { LicenseInput } from "./file.input";

export interface UploadFileBodyInterface {
    scope: ScopeInterface;
    folderId?: string;
    title?: string;
    altText?: string;
    license?: LicenseInput;
    imageCropArea?: ImageCropAreaInput;
    importSourceId?: string;
    importSourceType?: string;
}

export function createUploadFileBody({ Scope }: { Scope: Type<ScopeInterface> }): Type<UploadFileBodyInterface> {
    class UploadFileBody implements UploadFileBodyInterface {
        @Transform(({ value }) => plainToInstance(Scope, JSON.parse(value)))
        @ValidateNested()
        scope: ScopeInterface;

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
