import { Field, ID, InputType } from "@nestjs/graphql";
import { IsArray, IsBoolean, IsDate, IsObject, IsOptional, IsString, IsUUID } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import type { ContentScope } from "../interfaces/content-scope.interface.js";
import { CombinedPermission, type Permission } from "../user-permissions.types.js";

@InputType()
export class UserPermissionOverrideContentScopesInput {
    @Field(() => ID)
    @IsUUID()
    permissionId: string;

    @Field(() => Boolean)
    @IsBoolean()
    overrideContentScopes: boolean;

    @Field(() => [GraphQLJSONObject], { defaultValue: [] })
    @IsArray()
    @IsObject({ each: true })
    contentScopes: ContentScope[] = [];
}

@InputType()
export class UserPermissionInput {
    @Field(() => CombinedPermission)
    @IsString()
    permission: Permission;

    @Field(() => Date, { nullable: true })
    @IsDate()
    @IsOptional()
    validFrom?: Date;

    @Field(() => Date, { nullable: true })
    @IsDate()
    @IsOptional()
    validTo?: Date;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    reason?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    requestedBy?: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    approvedBy?: string;
}
