import { PageTreeNodeBaseCreateInput, PageTreeNodeBaseUpdateInput } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { UserGroup } from "@src/user-groups/user-group";
import { IsEnum, IsOptional } from "class-validator";

@InputType()
export class PageTreeNodeCreateInput extends PageTreeNodeBaseCreateInput {
    @Field(() => UserGroup, { defaultValue: UserGroup.all })
    @IsEnum(UserGroup)
    @IsOptional()
    userGroup?: UserGroup;
}

@InputType()
export class PageTreeNodeUpdateInput extends PageTreeNodeBaseUpdateInput {
    @Field(() => UserGroup, { defaultValue: UserGroup.all })
    @IsEnum(UserGroup)
    @IsOptional()
    userGroup?: UserGroup;
}
