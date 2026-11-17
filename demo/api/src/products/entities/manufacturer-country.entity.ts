import { Entity, Property } from "@mikro-orm/decorators/legacy";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity({
    expression:
        'SELECT "addressAsEmbeddable_country" AS id, "addressAsEmbeddable_country" AS label, COUNT(*)::int AS used FROM "Manufacturer" GROUP BY "addressAsEmbeddable_country"',
})
export class ManufacturerCountry {
    @Field()
    @Property()
    id: string;

    @Field()
    @Property()
    label: string;

    @Field()
    @Property()
    used: number;
}
