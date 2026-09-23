import { Embeddable, Enum, Property } from "@mikro-orm/decorators/legacy";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum LicenseType {
    ROYALTY_FREE = "ROYALTY_FREE",
    RIGHTS_MANAGED = "RIGHTS_MANAGED",
}
registerEnumType(LicenseType, { name: "LicenseType" });

@ObjectType("DamFileLicense")
@Embeddable()
export class License {
    @Enum({ items: () => LicenseType, nullable: true })
    @Field(() => LicenseType, { nullable: true })
    type?: LicenseType;

    @Property({
        columnType: "text",
        nullable: true,
    })
    @Field({ nullable: true })
    details?: string;

    @Property({
        columnType: "text",
        nullable: true,
    })
    @Field({ nullable: true })
    author?: string;

    @Property({
        columnType: "timestamp with time zone",
        nullable: true,
    })
    @Field({ nullable: true })
    durationFrom?: Date;

    @Property({
        columnType: "timestamp with time zone",
        nullable: true,
    })
    @Field({ nullable: true })
    durationTo?: Date;
}
