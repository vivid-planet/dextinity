import { Entity, ManyToOne, OneToMany, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { generateInputHandling } from "../../generateCrud/generate-crud";
import { testPermission } from "../../utils/test-helper";
import { generateCrudInput } from "../generate-crud-input";

@Entity()
export class Foo extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @OneToMany(() => Bar, (bar) => bar.foo, { orphanRemoval: true })
    bars = new Collection<Bar>(this);
}

@Entity()
export class Bar extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    name: string;

    @ManyToOne(() => Foo, { ref: true, nullable: false })
    foo: Ref<Foo>;

    @OneToMany(() => Baz, (baz) => baz.bar, { orphanRemoval: true })
    bazs = new Collection<Baz>(this);
}

@Entity()
export class Baz extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    description: string;

    @ManyToOne(() => Bar, { ref: true, nullable: false })
    bar: Ref<Bar>;
}

describe("nested two level", () => {
    let orm: MikroORM;

    beforeAll(async () => {
        LazyMetadataStorage.load();
        orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [Foo, Bar, Baz],
            }),
        );
    });

    afterAll(async () => {
        await orm.close();
    });
    //Foo -> Bar -> Baz
    //foo.bars[].bazs[]
    it("input dto should reference the correct import", async () => {
        const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("Foo"));
        const fooInputDto = out.find((f) => f.name == "dto/foo.input.ts");
        if (!fooInputDto) {
            throw new Error();
        }

        expect(fooInputDto.content).toContain(`bars: FooNestedBarInput[];`);
        expect(fooInputDto.content).toContain(`import { FooNestedBarInput } from "./foo-nested-bar.input";`);
    });
    it("create input handling should work", async () => {
        const { code, imports } = generateInputHandling(
            {
                mode: "create",
                inputName: "input",
                assignEntityCode: `const foo = this.entityManager.create(Foo, {`,
            },
            orm.em.getMetadata().getByClassName("Foo"),
            { requiredPermission: testPermission },
            __dirname,
        );
        expect(imports.map((i) => i.name)).toEqual(["Bar", "Baz"]);
        expect(code).toMatchSnapshot();
    });
    it("update input handling should work", async () => {
        const { code, imports } = generateInputHandling(
            {
                mode: "update",
                inputName: "input",
                assignEntityCode: `foo.assign({`,
            },
            orm.em.getMetadata().getByClassName("Foo"),
            { requiredPermission: testPermission },
            __dirname,
        );
        expect(imports.map((i) => i.name)).toEqual(["Bar", "Baz"]);
        expect(code).toMatchSnapshot();
    });
});
