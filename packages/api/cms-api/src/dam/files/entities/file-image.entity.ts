import { BaseEntity, Embedded, Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";
import { v4 as uuid } from "uuid";

import { ImageCropArea } from "../../images/entities/image-crop-area.entity";
import type { FileInterface } from "./file.entity";

@Entity({ tableName: "DamFileImage" })
@ObjectType("DamFileImage")
export class DamFileImage extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property({ columnType: "integer" })
    @Field(() => Int)
    width: number;

    @Property({ columnType: "integer" })
    @Field(() => Int)
    height: number;

    @Property({ type: "json", nullable: true })
    @Field(() => GraphQLJSONObject, { nullable: true })
    exif?: Record<string, number | string | Array<number> | Uint8Array | Uint16Array>;

    @Property({ columnType: "text", nullable: true })
    @Field({ nullable: true })
    dominantColor?: string;

    @Embedded(() => ImageCropArea)
    @Field(() => ImageCropArea)
    cropArea: ImageCropArea;

    // Relation is defined in createFileEntity since the file entity is created by the application
    file: FileInterface;
}
