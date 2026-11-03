import { BaseEntity, Embedded, Entity, OneToOne, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { randomUUID } from "crypto";
import { GraphQLJSONObject } from "graphql-scalars";

import { ImageCropArea } from "../../images/entities/image-crop-area.entity";
import { FileInterface } from "./file.entity";

@Entity({ tableName: "DamFileImage" })
@ObjectType("DamFileImage")
export class DamFileImage extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

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

    @OneToOne({ entity: "DamFile", mappedBy: (file: FileInterface) => file.image, deleteRule: "CASCADE" })
    file: FileInterface;
}
