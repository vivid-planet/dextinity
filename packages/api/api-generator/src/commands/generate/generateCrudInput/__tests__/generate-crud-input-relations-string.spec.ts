import { Entity, ManyToOne, PrimaryKey, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { ID } from "@nestjs/graphql";
import { Field } from "@nestjs/graphql/dist/decorators/field.decorator.js";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { formatSource, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrudInput } from "../generate-crud-input";

@Entity()
export class Foo extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Field(() => RelationTypeId, { nullable: true })
    @ManyToOne(() => RelationTypeId, { nullable: true, ref: true })
    relationTypeId?: Ref<RelationTypeId>;

    @Field(() => RelationTypeString, { nullable: true })
    @ManyToOne(() => RelationTypeString, { nullable: true, ref: true })
    relationTypeString?: Ref<RelationTypeString>;
}

@Entity()
export class RelationTypeId extends BaseEntity {
    @Field(() => ID)
    @PrimaryKey({
        type: "text",
    })
    id: string;
}

@Entity()
export class RelationTypeString extends BaseEntity {
    @Field()
    @PrimaryKey({
        type: "text",
    })
    id: string;
}

describe("GenerateCrudInputRelationsString", () => {
    let orm: MikroORM;

    beforeAll(async () => {
        LazyMetadataStorage.load();
        orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [Foo, RelationTypeId, RelationTypeString],
            }),
        );
    });

    afterAll(async () => {
        await orm.close();
    });
    it("n:1 input dto should contain relation id as ID or string", async () => {
        const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("Foo"));
        const formattedOut = await formatSource(out[0].content);
        const source = parseSource(formattedOut);

        const classes = source.getClasses();
        expect(classes.length).toBe(2);

        const cls = classes[0];
        const structure = cls.getStructure();
        expect(structure.properties?.length).toBe(2);
        {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const prop = structure.properties![0];
            expect(prop.name).toBe("relationTypeId");
            expect(prop.type).toBe("string");
        }
        {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const prop = structure.properties![1];
            expect(prop.name).toBe("relationTypeString");
            expect(prop.type).toBe("string");
        }
        expect(cls.getText()).toMatchSnapshot();
    });
});
