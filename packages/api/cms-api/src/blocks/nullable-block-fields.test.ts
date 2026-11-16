import { Type } from "class-transformer";
import { IsString, validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { IsNullable } from "../common/validators/is-nullable.js";
import { BlockData, BlockInput, blockInputToData, createBlock, transformToBlockSave } from "./block.js";
import { BlockField } from "./decorators/field.js";
import { BlockMigration } from "./migrations/BlockMigration.js";
import type { BlockMigrationInterface } from "./migrations/types.js";
import { typeSafeBlockMigrationPipe } from "./migrations/typeSafeBlockMigrationPipe.js";

class NestedItem extends BlockData {
    @BlockField({ type: "string", nullable: true })
    caption: string | null;

    @BlockField()
    title: string;
}

class NullableFieldsBlockData extends BlockData {
    @BlockField({ type: "string", nullable: true })
    headline: string | null;

    @BlockField()
    text: string;

    @BlockField(NestedItem)
    @Type(() => NestedItem)
    items: NestedItem[];
}

class NullableFieldsBlockInput extends BlockInput {
    @IsNullable()
    @IsString()
    @BlockField({ type: "string", nullable: true })
    headline: string | null;

    @IsString()
    @BlockField()
    text: string;

    transformToBlockData(): NullableFieldsBlockData {
        return blockInputToData(NullableFieldsBlockData, this);
    }
}

const NullableFieldsBlock = createBlock(NullableFieldsBlockData, NullableFieldsBlockInput, "NullableFields");

class AddDefaultHeadlineMigration
    extends BlockMigration<(from: { headline?: string | null }) => { headline: string | null }>
    implements BlockMigrationInterface
{
    public readonly toVersion = 1;

    protected migrate(from: { headline?: string | null }): { headline: string | null } {
        return { ...from, headline: from.headline === undefined ? "default" : from.headline };
    }
}

describe("nullable block fields", () => {
    it("should set missing nullable fields to null when loading block data that wasn't migrated yet", () => {
        const data = NullableFieldsBlock.blockDataFactory({ text: "text", items: [{ title: "item" }] });

        expect(transformToBlockSave(data)).toEqual({ headline: null, text: "text", items: [{ caption: null, title: "item" }], $$coreVersion: 1 });
    });

    it("should not migrate block data a second time", () => {
        const data = NullableFieldsBlock.blockDataFactory({ text: "text", items: [{ title: "item" }], $$coreVersion: 1 });

        expect(transformToBlockSave(data)).toEqual({ text: "text", items: [{ title: "item" }], $$coreVersion: 1 });
    });

    it("should stamp the core version on block data created from an input", () => {
        const data = NullableFieldsBlock.blockInputFactory({ headline: null, text: "text" }).transformToBlockData();

        expect(transformToBlockSave(data)).toMatchObject({ $$coreVersion: 1 });
    });

    it("should leave the core version out of the plain block data", async () => {
        const data = NullableFieldsBlock.blockDataFactory({ text: "text", items: [] });

        expect(await data.transformToPlain({})).not.toHaveProperty("$$coreVersion");
    });

    it("should keep the values of nullable fields", () => {
        const data = NullableFieldsBlock.blockDataFactory({ headline: "headline", text: "text", items: [] });

        expect(transformToBlockSave(data)).toMatchObject({ headline: "headline" });
    });

    it("should leave missing non-nullable fields untouched", () => {
        const data = NullableFieldsBlock.blockDataFactory({ items: [] });

        expect(transformToBlockSave(data)).not.toHaveProperty("text");
    });

    it("should run the block's own migrations first", () => {
        const MigratedBlock = createBlock(NullableFieldsBlockData, NullableFieldsBlockInput, {
            name: "MigratedNullableFields",
            migrate: { version: 1, migrations: typeSafeBlockMigrationPipe([AddDefaultHeadlineMigration]) },
        });

        const data = MigratedBlock.blockDataFactory({ text: "text", items: [] });

        expect(transformToBlockSave(data)).toMatchObject({ headline: "default", $$version: 1, $$coreVersion: 1 });
    });

    it("should accept null for a nullable field in the block input", async () => {
        const errors = await validate(NullableFieldsBlock.blockInputFactory({ headline: null, text: "text" }));

        expect(errors).toHaveLength(0);
    });

    it("should reject a missing nullable field in the block input", async () => {
        const errors = await validate(NullableFieldsBlock.blockInputFactory({ text: "text" } as never));

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("headline");
    });
});
