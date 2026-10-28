import { Field, Float, InputType } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsOptional, Max, Min, ValidateIf } from "class-validator";

import { FocalPoint } from "../../../file-utils/focal-point.enum.js";

@InputType({ isAbstract: true })
export class ImageCropAreaInput {
    @Field(() => FocalPoint)
    @IsEnum(FocalPoint)
    focalPoint: FocalPoint;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    width?: number;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    height?: number;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsOptional()
    @IsNumber()
    x?: number;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsOptional()
    @IsNumber()
    y?: number;
}
