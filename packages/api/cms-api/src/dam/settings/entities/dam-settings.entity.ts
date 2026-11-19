import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { FILE_ENTITY, FileInterface } from "../../files/entities/file.entity";
import { DamScopeInterface } from "../../types";

@Entity()
@ObjectType()
export class DamSettings extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @Property({ type: "jsonb", nullable: true })
    scope?: DamScopeInterface;

    @ManyToOne({
        entity: () => FILE_ENTITY,
        joinColumn: "invalidLicenseFallbackImageId",
        nullable: true,
        deleteRule: "set null",
        ref: true,
    })
    invalidLicenseFallbackImage?: Ref<FileInterface>;
}
