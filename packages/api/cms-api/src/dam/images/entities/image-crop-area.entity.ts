import { Embeddable, Enum, Property } from "@mikro-orm/decorators/legacy";
import { Field, Float, ObjectType } from "@nestjs/graphql";

import { FocalPoint } from "../../../file-utils/focal-point.enum";

@Embeddable()
@ObjectType()
export class ImageCropArea {
    @Enum({ items: () => FocalPoint })
    @Field(() => FocalPoint)
    focalPoint: FocalPoint;

    @Property({ columnType: "double precision", nullable: true })
    @Field(() => Float, { nullable: true })
    width?: number;

    @Property({ columnType: "double precision", nullable: true })
    @Field(() => Float, { nullable: true })
    height?: number;

    @Property({ columnType: "double precision", nullable: true })
    @Field(() => Float, { nullable: true })
    x?: number;

    @Property({ columnType: "double precision", nullable: true })
    @Field(() => Float, { nullable: true })
    y?: number;
}
