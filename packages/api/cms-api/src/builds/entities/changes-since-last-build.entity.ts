import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, OptionalProps } from "@mikro-orm/postgresql";
import { randomUUID } from "crypto";

import type { ContentScope } from "../../user-permissions/interfaces/content-scope.interface.js";

@Entity()
export class ChangesSinceLastBuild extends BaseEntity {
    [OptionalProps]?: "createdAt";

    @PrimaryKey({ columnType: "uuid" })
    id: string = randomUUID();

    @Property({
        columnType: "timestamp with time zone",
    })
    createdAt: Date = new Date();

    @Property({ type: "json" })
    scope: "all" | ContentScope;
}
