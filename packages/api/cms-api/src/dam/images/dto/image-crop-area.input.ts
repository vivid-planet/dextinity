import { Field, Float, InputType } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsPositive, Max, ValidateIf } from "class-validator";

import { FocalPoint } from "../../../file-utils/focal-point.enum";

@InputType({ isAbstract: true })
export class ImageCropAreaInput {
    @Field(() => FocalPoint)
    @IsEnum(FocalPoint)
    focalPoint: FocalPoint;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsPositive()
    @Max(100)
    width?: number;

    @Field(() => Float, { nullable: true })
    @ValidateIf((icz) => icz.focalPoint !== FocalPoint.SMART)
    @IsPositive()
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
