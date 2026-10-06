import { ArgsType, Field, InputType, registerEnumType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";

import { StringFilter } from "../../common/filter/string.filter.js";
import { OffsetBasedPaginationArgs } from "../../common/pagination/offset-based.args.js";
import { SortDirection } from "../../common/sorting/sort-direction.enum.js";
import { CombinedPermission, type Permission } from "../user-permissions.types.js";

@InputType()
export class PermissionFilter {
    @Field(() => CombinedPermission, { nullable: true })
    @IsOptional()
    @IsString()
    equal?: Permission;

    @Field(() => CombinedPermission, { nullable: true })
    @IsOptional()
    @IsString()
    notEqual?: Permission;

    @Field(() => [CombinedPermission], { nullable: true })
    @IsOptional()
    @IsString({ each: true })
    isAnyOf?: Permission[];
}

@InputType()
class UserPermissionsUserFilter {
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    name?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    email?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    status?: StringFilter;

    @Field(() => PermissionFilter, { nullable: true })
    @ValidateNested()
    @Type(() => PermissionFilter)
    permission?: PermissionFilter;

    @Field(() => [UserPermissionsUserFilter], { nullable: true })
    @Type(() => UserPermissionsUserFilter)
    @ValidateNested({ each: true })
    and?: UserPermissionsUserFilter[];

    @Field(() => [UserPermissionsUserFilter], { nullable: true })
    @Type(() => UserPermissionsUserFilter)
    @ValidateNested({ each: true })
    or?: UserPermissionsUserFilter[];
}

enum UserPermissionsUserSortField {
    name = "name",
    email = "email",
    status = "status",
}
registerEnumType(UserPermissionsUserSortField, {
    name: "UserPermissionsUserSortField",
});

@InputType()
class UserPermissionsUserSort {
    @Field(() => UserPermissionsUserSortField)
    @IsEnum(UserPermissionsUserSortField)
    field: UserPermissionsUserSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}

@ArgsType()
export class FindUsersArgs extends OffsetBasedPaginationArgs {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;

    @Field(() => UserPermissionsUserFilter, { nullable: true })
    @ValidateNested()
    @Type(() => UserPermissionsUserFilter)
    filter?: UserPermissionsUserFilter;

    @Field(() => [UserPermissionsUserSort], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => UserPermissionsUserSort)
    sort?: UserPermissionsUserSort[];
}
