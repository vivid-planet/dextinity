import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty } from "class-validator";

@InputType()
export class ProductNestedProductStatisticsInput {
    @IsNotEmpty()
    @IsInt()
    @Field(() => Int)
    views: number;
}
