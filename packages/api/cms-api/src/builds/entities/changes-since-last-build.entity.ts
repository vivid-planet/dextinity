import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity, OptionalProps } from "@mikro-orm/postgresql";
import { v4 as uuid } from "uuid";

import { ContentScope } from "../../user-permissions/interfaces/content-scope.interface";

@Entity()
export class ChangesSinceLastBuild extends BaseEntity {
    [OptionalProps]?: "createdAt";

    @PrimaryKey({ columnType: "uuid" })
    id: string = uuid();

    @Property({
        columnType: "timestamp with time zone",
    })
    createdAt: Date = new Date();

    @Property({ type: "json" })
    scope: "all" | ContentScope;
}
