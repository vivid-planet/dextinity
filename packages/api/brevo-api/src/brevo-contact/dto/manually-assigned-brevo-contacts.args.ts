import { OffsetBasedPaginationArgs } from "@dextinity/cms-api";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@ArgsType()
export class ManuallyAssignedBrevoContactsArgs extends OffsetBasedPaginationArgs {
    @Field(() => ID)
    @IsString()
    targetGroupId: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    email?: string;
}
