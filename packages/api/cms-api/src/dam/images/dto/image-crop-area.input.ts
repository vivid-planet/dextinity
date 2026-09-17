import { Field, Float, InputType } from "@nestjs/graphql";
import { IsEnum, IsNumber, Max, Min, ValidateIf } from "class-validator";

import { FocalPoint } from "../../../file-utils/focal-point.enum";

@InputType({ isAbstract: true })
export class ImageCropAreaInput {
    @Field(() => FocalPoint)
    @IsEnum(FocalPoint)
    focalPoint: FocalPoint;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsNumber()
    @Min(0)
    @Max(100)
    width?: number;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsNumber()
    @Min(0)
    @Max(100)
    height?: number;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsNumber()
    x?: number;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsNumber()
    y?: number;
}
