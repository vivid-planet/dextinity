import { DateTimeFilter, IdFilter, ManyToManyFilter, OneToManyFilter, StringFilter } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class ProductTagFilter {
    @Field(() => IdFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => IdFilter)
    id?: IdFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    title?: StringFilter;
    @Field(() => ManyToManyFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => ManyToManyFilter)
    products?: ManyToManyFilter;
    @Field(() => OneToManyFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => OneToManyFilter)
    productsWithStatus?: OneToManyFilter;
    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    createdAt?: DateTimeFilter;
    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    updatedAt?: DateTimeFilter;
    @Field(() => [ProductTagFilter], { nullable: true })
    @Type(() => ProductTagFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: ProductTagFilter[];
    @Field(() => [ProductTagFilter], { nullable: true })
    @Type(() => ProductTagFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: ProductTagFilter[];
}
