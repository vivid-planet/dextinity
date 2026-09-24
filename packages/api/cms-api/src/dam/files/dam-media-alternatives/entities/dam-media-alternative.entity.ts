import { BaseEntity, Entity, Enum, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { ScopedEntity } from "../../../../user-permissions/decorators/scoped-entity.decorator";
import type { FileInterface } from "../../entities/file.entity";

export enum DamMediaAlternativeType {
    captions = "captions",
}
registerEnumType(DamMediaAlternativeType, { name: "DamMediaAlternativeType" });

@Entity()
@ObjectType()
@ScopedEntity(async (damMediaAlternative: DamMediaAlternative) => {
    const scope = (await damMediaAlternative.for.load())?.scope;
    return scope;
})
export class DamMediaAlternative extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property({ columnType: "text" })
    @Field()
    language: string;

    @Enum({ items: () => DamMediaAlternativeType })
    @Field(() => DamMediaAlternativeType)
    type: DamMediaAlternativeType;

    // Relations are defined in createFileEntity since the file entity is created by the application
    for: Ref<FileInterface>;

    alternative: Ref<FileInterface>;
}
