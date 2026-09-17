import { Embedded, Entity, OneToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-scalars";
import { v4 as uuid } from "uuid";

import { ImageCropArea } from "../../images/entities/image-crop-area.entity";
import { FileInterface } from "./file.entity";
import { resolveFileEntity } from "./resolve-dam-entity";

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

    @OneToOne({ entity: () => resolveFileEntity(), mappedBy: (file: FileInterface) => file.image, deleteRule: "CASCADE" })
    file: FileInterface;
}
