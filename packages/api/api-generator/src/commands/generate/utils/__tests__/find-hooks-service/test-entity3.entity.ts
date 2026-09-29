import { CrudGenerator } from "@dextinity/cms-api";
import { BaseEntity, Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { v4 as uuid } from "uuid";

import { testPermission } from "../../test-helper";
import { TestEntity3Service } from "./test-entity3.service";

@Entity()
@CrudGenerator({
    requiredPermission: testPermission,
    hooksService: TestEntity3Service,
})
export class TestEntity3 extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    foo: string;
}
