import { CrudGenerator } from "@dextinity/cms-api";
import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "@mikro-orm/postgresql";
import { randomUUID } from "crypto";

import { testPermission } from "../../test-helper.js";
import { TestEntityService } from "./test-entity.service.js";

@Entity()
@CrudGenerator({
    requiredPermission: testPermission,
    hooksService: TestEntityService,
})
export class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property()
    foo: string;
}
