import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";

import type { ContentScope } from "../interfaces/content-scope.interface.js";

@Entity({ tableName: "DextinityUserContentScopes" })
export class UserContentScopes {
    @PrimaryKey()
    @Property()
    userId: string;

    @Property({ type: "json" })
    contentScopes: ContentScope[] = [];
}
