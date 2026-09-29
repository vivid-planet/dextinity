import { CrudGenerator } from "@dextinity/cms-api";
import { BaseEntity, Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { v4 as uuid } from "uuid";

import { testPermission } from "../../test-helper";
import { TestEntityService } from "./test-entity.service";

@Entity()
@CrudGenerator({
    requiredPermission: testPermission,
    hooksService: TestEntityService,
})
export class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    foo: string;
}
