import { BaseEntity, type Ref } from "@mikro-orm/core";
import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { ActionLogs } from "../../../action-logs/action-logs.decorator.js";
import { RequiredPermission } from "../../../user-permissions/decorators/required-permission.decorator.js";
import type { FileInterface } from "../../files/entities/file.entity.js";
import { resolveFileEntity } from "../../files/entities/resolve-dam-entity.js";
import type { DamScopeInterface } from "../../types.js";

@Entity()
@ObjectType()
@RequiredPermission("dam")
@ActionLogs()
export class DamSettings extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @Property({ type: "jsonb", nullable: true })
    scope?: DamScopeInterface;

    @ManyToOne({
        entity: () => resolveFileEntity(),
        joinColumn: "invalidLicenseFallbackImageId",
        nullable: true,
        deleteRule: "set null",
        ref: true,
    })
    invalidLicenseFallbackImage?: Ref<FileInterface>;
}
