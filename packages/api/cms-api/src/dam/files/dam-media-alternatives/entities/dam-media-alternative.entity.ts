import { BaseEntity, Ref } from "@mikro-orm/core";
import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { ScopedEntity } from "../../../../user-permissions/decorators/scoped-entity.decorator";
import { FileInterface } from "../../entities/file.entity";
import { resolveFileEntity } from "../../entities/resolve-dam-entity";

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

    @ManyToOne({
        entity: () => resolveFileEntity(),
        inversedBy: (file: FileInterface) => file.alternativesForThisFile,
        deleteRule: "cascade",
        ref: true,
    })
    for: Ref<FileInterface>;

    @ManyToOne({
        entity: () => resolveFileEntity(),
        inversedBy: (file: FileInterface) => file.thisFileIsAlternativeFor,
        deleteRule: "cascade",
        ref: true,
    })
    alternative: Ref<FileInterface>;
}
