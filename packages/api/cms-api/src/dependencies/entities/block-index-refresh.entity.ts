import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "@mikro-orm/postgresql";
import { v4 as uuid } from "uuid";

@Entity()
export class BlockIndexRefresh extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    id: string = uuid();

    @Property({
        columnType: "timestamp with time zone",
    })
    startedAt: Date;

    @Property({
        columnType: "timestamp with time zone",
        nullable: true,
    })
    finishedAt: Date | null;
}
