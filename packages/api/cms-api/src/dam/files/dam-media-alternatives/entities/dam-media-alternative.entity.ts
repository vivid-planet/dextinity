import { BaseEntity, Entity, Enum, ManyToOne, PrimaryKey, Property, Ref } from "@mikro-orm/core";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { randomUUID } from "crypto";

import { ScopedEntity } from "../../../../user-permissions/decorators/scoped-entity.decorator";
import { FILE_ENTITY, FileInterface } from "../../entities/file.entity";

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
    id: string = randomUUID();

    @Property({ columnType: "text" })
    @Field()
    language: string;

    @Enum({ items: () => DamMediaAlternativeType })
    @Field(() => DamMediaAlternativeType)
    type: DamMediaAlternativeType;

    @ManyToOne({
        entity: () => FILE_ENTITY,
        inversedBy: (file: FileInterface) => file.alternativesForThisFile,
        deleteRule: "cascade",
        ref: true,
    })
    for: Ref<FileInterface>;

    @ManyToOne({
        entity: () => FILE_ENTITY,
        inversedBy: (file: FileInterface) => file.thisFileIsAlternativeFor,
        deleteRule: "cascade",
        ref: true,
    })
    alternative: Ref<FileInterface>;
}
