import { CrudField, CrudGenerator } from "@dextinity/cms-api";
import { Entity, Property } from "@mikro-orm/postgresql";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity({
    expression:
        'SELECT "addressAsEmbeddable_country" AS id, "addressAsEmbeddable_country" AS label, COUNT(*) AS used FROM "Manufacturer" GROUP BY "addressAsEmbeddable_country"',
})
// view-entity can't be saved or updated so disable create, update and delete
@CrudGenerator({
    requiredPermission: ["manufacturers"],
    single: false,
    create: false,
    update: false,
    delete: false,
})
export class ManufacturerCountry {
    @Field()
    @Property()
    @CrudField({ sort: false }) // sort for "group by"-views currently not supported
    id: string;

    @Field()
    @Property()
    @CrudField({ sort: false }) // sort for "group by"-views currently not supported
    label: string;

    @Field()
    @Property()
    @CrudField({ sort: false }) // sort for "group by"-views currently not supported
    used: number;
}
