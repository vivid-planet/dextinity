import { describe, expect, it } from "vitest";

import { BlockData, BlockInput, blockInputToData, createBlock, transformToBlockSave } from "../block";
import { BlockField } from "../decorators/field";
import { applyBlockMigrations } from "./applyMigrations";
import { BlockMigration } from "./BlockMigration";
import type { BlockMigrationInterface, BlockMigrationScopeOptions } from "./types";
import { typeSafeBlockMigrationPipe } from "./typeSafeBlockMigrationPipe";

interface Data {
    library?: string[];
    project?: string[];
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

describe("block migration scopes", () => {
    it("counts a scope independently of the block's own version", () => {
        const migrated = applyBlockMigrations(
            {},
            {
                version: 2,
                migrations: typeSafeBlockMigrationPipe([buildAppendMigration("library", "lib1", 1), buildAppendMigration("library", "lib2", 2)]),
                scopes: {
                    project: { version: 1, migrations: typeSafeBlockMigrationPipe([buildAppendMigration("project", "project1", 1)]) },
                },
            },
        );

        expect(migrated).toEqual({
            library: ["lib1", "lib2"],
            project: ["project1"],
            $$version: 2,
            $$versions: { project: 1 },
        });
    });

    it("keeps applying the block's own migrations to data that has no scope versions yet", () => {
        const migrated = applyBlockMigrations(
            { library: ["lib1"], $$version: 1 },
            {
                version: 2,
                migrations: typeSafeBlockMigrationPipe([buildAppendMigration("library", "lib1", 1), buildAppendMigration("library", "lib2", 2)]),
                scopes: {
                    project: { version: 1, migrations: typeSafeBlockMigrationPipe([buildAppendMigration("project", "project1", 1)]) },
                },
            },
        );

        expect(migrated).toEqual({
            library: ["lib1", "lib2"],
            project: ["project1"],
            $$version: 2,
            $$versions: { project: 1 },
        });
    });

    it("does not re-run a scope migration that was already applied", () => {
        const migrated = applyBlockMigrations(
            { project: ["project1"], $$versions: { project: 1 } },
            {
                scopes: {
                    project: { version: 1, migrations: typeSafeBlockMigrationPipe([buildAppendMigration("project", "project1", 1)]) },
                },
            },
        );

        expect(migrated).toEqual({ project: ["project1"], $$versions: { project: 1 } });
    });

    it("keeps scopes independent of each other", () => {
        const migrated = applyBlockMigrations(
            { project: ["p1"], $$versions: { project: 1 } },
            {
                scopes: {
                    library: { version: 1, migrations: typeSafeBlockMigrationPipe([buildAppendMigration("library", "lib1", 1)]) },
                    project: {
                        version: 2,
                        migrations: typeSafeBlockMigrationPipe([buildAppendMigration("project", "p1", 1), buildAppendMigration("project", "p2", 2)]),
                    },
                },
            },
        );

        expect(migrated).toEqual({
            library: ["lib1"],
            project: ["p1", "p2"],
            $$versions: { library: 1, project: 2 },
        });
    });

    it("requires each scope to start counting at 1", () => {
        expect(() =>
            applyBlockMigrations(
                {},
                { scopes: { project: { version: 2, migrations: [buildAppendMigration("project", "p2", 2)] } } },
                "ScopeOutOfSequence",
            ),
        ).toThrowError(/migration scope "project" of Block ScopeOutOfSequence/);
    });

    describe("initialVersionFromLegacy", () => {
        // A migration that used to be version 2 of the block's own chain and has moved into a scope
        const relocated: BlockMigrationScopeOptions = {
            version: 1,
            migrations: typeSafeBlockMigrationPipe([buildAppendMigration("project", "relocated", 1)]),
            initialVersionFromLegacy: (legacyVersion) => (legacyVersion >= 2 ? 1 : 0),
        };
        const migrate = {
            version: 1,
            migrations: typeSafeBlockMigrationPipe([buildAppendMigration("library", "lib1", 1)]),
            scopes: { project: relocated },
        };

        it("skips the migration for data that ran it under the legacy counter", () => {
            const migrated = applyBlockMigrations({ library: ["lib1"], project: ["relocated"], $$version: 2 }, migrate);

            expect(migrated).toEqual({
                library: ["lib1"],
                project: ["relocated"],
                $$version: 2,
                $$versions: { project: 1 },
            });
        });

        it("still applies the migration for data that stopped before it", () => {
            const migrated = applyBlockMigrations({ library: ["lib1"], $$version: 1 }, migrate);

            expect(migrated).toEqual({
                library: ["lib1"],
                project: ["relocated"],
                $$version: 1,
                $$versions: { project: 1 },
            });
        });
    });
});

describe("block with migration scopes", () => {
    // Appends its name to `text`, so the saved value shows which migrations ran
    function buildAppendTextMigration(name: string, migrationToVersion: number) {
        return class AppendTextMigration extends BlockMigration<(from: { text: string }) => { text: string }> implements BlockMigrationInterface {
            public readonly toVersion = migrationToVersion;

            protected migrate({ text }: { text: string }): { text: string } {
                return { text: `${text}+${name}` };
            }
        };
    }

    class ScopedBlockData extends BlockData {
        @BlockField()
        text: string;
    }

    class ScopedBlockInput extends BlockInput {
        @BlockField()
        text: string;

        transformToBlockData(): ScopedBlockData {
            return blockInputToData(ScopedBlockData, this);
        }
    }

    const ScopedBlock = createBlock(ScopedBlockData, ScopedBlockInput, {
        name: "ScopedMigrations",
        migrate: {
            version: 1,
            migrations: typeSafeBlockMigrationPipe([buildAppendTextMigration("lib1", 1)]),
            scopes: {
                project: {
                    version: 2,
                    migrations: typeSafeBlockMigrationPipe([buildAppendTextMigration("p1", 1), buildAppendTextMigration("p2", 2)]),
                },
            },
        },
    });

    it("stamps the block version and every scope version when saving", () => {
        expect(transformToBlockSave(ScopedBlock.blockDataFactory({ text: "hello" }))).toEqual({
            text: "hello+lib1+p1+p2",
            $$version: 1,
            $$versions: { project: 2 },
        });
    });

    it("strips the version counters when transforming to plain", async () => {
        const plain = await ScopedBlock.blockDataFactory({ text: "hello" }).transformToPlain({});

        expect(plain).toEqual({ text: "hello+lib1+p1+p2" });
    });
});
