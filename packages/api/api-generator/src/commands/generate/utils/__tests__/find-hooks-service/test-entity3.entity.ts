import { CrudGenerator } from "@dextinity/cms-api";
import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "@mikro-orm/postgresql";
import { randomUUID } from "crypto";

import { testPermission } from "../../test-helper.js";
import { TestEntity3Service } from "./test-entity3.service.js";

@Entity()
@CrudGenerator({
    requiredPermission: testPermission,
    hooksService: TestEntity3Service,
})
export class TestEntity3 extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property()
    foo: string;
}
