import { describe, expect, it } from "vitest";

import { BlockData, BlockInput, blockInputToData, createBlock, transformToBlockSave } from "../block";
import { BlockField } from "../decorators/field";
import { applyBlockMigrations } from "./applyMigrations";
import { BlockMigration } from "./BlockMigration";
import type { BlockMigrationInterface } from "./types";
import { typeSafeBlockMigrationPipe } from "./typeSafeBlockMigrationPipe";

interface Data {
    vendor?: string[];
    own?: string[];
}

// Each migration appends its name to the chain it belongs to, so the resulting arrays show
// which migrations ran, and in which order
function buildAppendMigration(chain: keyof Data, name: string, migrationToVersion: number) {
    return class AppendMigration extends BlockMigration<(from: Data) => Data> implements BlockMigrationInterface {
        public readonly toVersion = migrationToVersion;

        protected migrate(from: Data): Data {
            return { ...from, [chain]: [...(from[chain] ?? []), name] };
        }
    };
}

describe("vendor block migrations", () => {
    it("counts the vendor chain independently of the block's own version", () => {
        const migrated = applyBlockMigrations(
            {},
            {
                version: 1,
                migrations: typeSafeBlockMigrationPipe([buildAppendMigration("own", "own1", 1)]),
                vendorVersion: 2,
                vendorMigrations: typeSafeBlockMigrationPipe([
                    buildAppendMigration("vendor", "vendor1", 1),
                    buildAppendMigration("vendor", "vendor2", 2),
                ]),
            },
        );

        expect(migrated).toEqual({
            vendor: ["vendor1", "vendor2"],
            own: ["own1"],
            $$version: 1,
            $$vendorVersion: 2,
        });
    });

    it("runs the vendor migrations before the block's own migrations", () => {
        const order: string[] = [];

        class RecordingVendorMigration extends BlockMigration<(from: Data) => Data> implements BlockMigrationInterface {
            public readonly toVersion = 1;

            protected migrate(from: Data): Data {
                order.push("vendor");
                return from;
            }
        }

        class RecordingOwnMigration extends BlockMigration<(from: Data) => Data> implements BlockMigrationInterface {
            public readonly toVersion = 1;

            protected migrate(from: Data): Data {
                order.push("own");
                return from;
            }
        }

        applyBlockMigrations(
            {},
            {
                version: 1,
                migrations: typeSafeBlockMigrationPipe([RecordingOwnMigration]),
                vendorVersion: 1,
                vendorMigrations: typeSafeBlockMigrationPipe([RecordingVendorMigration]),
            },
        );

        expect(order).toEqual(["vendor", "own"]);
    });

    it("applies only the migrations the data hasn't run yet", () => {
        const migrated = applyBlockMigrations(
            { vendor: ["vendor1"], own: ["own1"], $$version: 1, $$vendorVersion: 1 },
            {
                version: 2,
                migrations: typeSafeBlockMigrationPipe([buildAppendMigration("own", "own1", 1), buildAppendMigration("own", "own2", 2)]),
                vendorVersion: 2,
                vendorMigrations: typeSafeBlockMigrationPipe([
                    buildAppendMigration("vendor", "vendor1", 1),
                    buildAppendMigration("vendor", "vendor2", 2),
                ]),
            },
        );

        expect(migrated).toEqual({
            vendor: ["vendor1", "vendor2"],
            own: ["own1", "own2"],
            $$version: 2,
            $$vendorVersion: 2,
        });
    });

    it("is a no-op once both chains are up to date", () => {
        const rawData = { vendor: ["vendor1"], own: ["own1"], $$version: 1, $$vendorVersion: 1 };

        const migrated = applyBlockMigrations(rawData, {
            version: 1,
            migrations: typeSafeBlockMigrationPipe([buildAppendMigration("own", "own1", 1)]),
            vendorVersion: 1,
            vendorMigrations: typeSafeBlockMigrationPipe([buildAppendMigration("vendor", "vendor1", 1)]),
        });

        expect(migrated).toEqual(rawData);
    });

    it("keeps the vendor counter when the block's own migrations run", () => {
        // A migration that returns only the fields it knows about must not drop the other chain's counter
        class ReplaceDataMigration extends BlockMigration<(from: Data) => Data> implements BlockMigrationInterface {
            public readonly toVersion = 1;

            protected migrate(): Data {
                return { own: ["own1"] };
            }
        }

        const migrated = applyBlockMigrations(
            { vendor: ["vendor1"], $$vendorVersion: 1 },
            {
                version: 1,
                migrations: typeSafeBlockMigrationPipe([ReplaceDataMigration]),
                vendorVersion: 1,
                vendorMigrations: typeSafeBlockMigrationPipe([buildAppendMigration("vendor", "vendor1", 1)]),
            },
        );

        expect(migrated).toEqual({ own: ["own1"], $$version: 1, $$vendorVersion: 1 });
    });

    it("requires the vendor migrations to start counting at 1", () => {
        expect(() =>
            applyBlockMigrations(
                {},
                { version: 0, migrations: [], vendorVersion: 2, vendorMigrations: [buildAppendMigration("vendor", "vendor2", 2)] },
                "VendorOutOfSequence",
            ),
        ).toThrowError(/the vendor migrations of Block VendorOutOfSequence/);
    });
});

describe("block with vendor migrations", () => {
    // Appends its name to `text`, so the saved value shows which migrations ran
    function buildAppendTextMigration(name: string, migrationToVersion: number) {
        return class AppendTextMigration extends BlockMigration<(from: { text: string }) => { text: string }> implements BlockMigrationInterface {
            public readonly toVersion = migrationToVersion;

            protected migrate({ text }: { text: string }): { text: string } {
                return { text: `${text}+${name}` };
            }
        };
    }

    class VendorMigratedBlockData extends BlockData {
        @BlockField()
        text: string;
    }

    class VendorMigratedBlockInput extends BlockInput {
        @BlockField()
        text: string;

        transformToBlockData(): VendorMigratedBlockData {
            return blockInputToData(VendorMigratedBlockData, this);
        }
    }

    const VendorMigratedBlock = createBlock(VendorMigratedBlockData, VendorMigratedBlockInput, {
        name: "VendorMigrated",
        migrate: {
            version: 2,
            migrations: typeSafeBlockMigrationPipe([buildAppendTextMigration("own1", 1), buildAppendTextMigration("own2", 2)]),
            vendorVersion: 1,
            vendorMigrations: typeSafeBlockMigrationPipe([buildAppendTextMigration("vendor1", 1)]),
        },
    });

    it("stamps both version counters when saving", () => {
        expect(transformToBlockSave(VendorMigratedBlock.blockDataFactory({ text: "hello" }))).toEqual({
            text: "hello+vendor1+own1+own2",
            $$version: 2,
            $$vendorVersion: 1,
        });
    });

    it("strips both version counters when transforming to plain", async () => {
        const plain = await VendorMigratedBlock.blockDataFactory({ text: "hello" }).transformToPlain({});

        expect(plain).toEqual({ text: "hello+vendor1+own1+own2" });
    });
});
