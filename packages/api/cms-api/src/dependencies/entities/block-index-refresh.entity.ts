import { BaseEntity, Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { randomUUID } from "crypto";

@Entity()
export class BlockIndexRefresh extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    id: string = randomUUID();

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
