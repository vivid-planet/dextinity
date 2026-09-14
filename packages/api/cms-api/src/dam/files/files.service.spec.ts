import type { EntityRepository, QueryBuilder } from "@mikro-orm/postgresql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FileFilterInput } from "./dto/file.args";
import type { FileInterface } from "./entities/file.entity";
import { FilesService } from "./files.service";

const FOLDER_ID = "11111111-1111-1111-1111-111111111111";
const FILE_ID_A = "22222222-2222-2222-2222-222222222222";
const FILE_ID_B = "33333333-3333-3333-3333-333333333333";

type AndWhereArg = Parameters<QueryBuilder<FileInterface>["andWhere"]>[0];

function createServiceWithMockQueryBuilder() {
    const andWhereArgs: AndWhereArg[] = [];

    const mockQb = {
        select: vi.fn().mockReturnThis(),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn(function (this: typeof mockQb, arg: AndWhereArg) {
            andWhereArgs.push(arg);
            return this;
        }),
        orderBy: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        getResult: vi.fn().mockResolvedValue([]),
        getCount: vi.fn().mockResolvedValue(0),
    };

    const filesRepository = {
        createQueryBuilder: vi.fn().mockReturnValue(mockQb),
    } as unknown as EntityRepository<FileInterface>;

    const service = new FilesService(
        filesRepository,
        null as never, // damMediaAlternativesRepository
        null as never, // blobStorageBackendService
        null as never, // foldersService
        null as never, // DAM_CONFIG
        null as never, // orm
        null as never, // entityManager
        null as never, // dominantColorCalculator
    );

    const hasFolderConstraint = () =>
        andWhereArgs.some((arg) => typeof arg === "object" && arg !== null && "folder" in (arg as Record<string, unknown>));

    return { service, andWhereArgs, hasFolderConstraint };
}

type CallArgs = { folderId?: string; filter?: FileFilterInput };

const callers = [
    {
        name: "findAll",
        call: (service: FilesService, args: CallArgs) => service.findAll(args),
    },
    {
        name: "findAndCount",
        call: (service: FilesService, args: CallArgs) => service.findAndCount({ ...args, offset: 0, limit: 25 }),
    },
];

describe.each(callers)("FilesService.$name — folder-by-default vs filter.ids", ({ call }) => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("constrains to the scope root (folder.id = null) when neither folderId nor filter.ids are provided", async () => {
        const { service, andWhereArgs, hasFolderConstraint } = createServiceWithMockQueryBuilder();

        await call(service, {});

        expect(hasFolderConstraint()).toBe(true);
        expect(andWhereArgs).toContainEqual({ folder: { id: null } });
    });

    it("constrains to the given folder when folderId is provided and filter.ids is not", async () => {
        const { service, andWhereArgs } = createServiceWithMockQueryBuilder();

        await call(service, { folderId: FOLDER_ID });

        expect(andWhereArgs).toContainEqual({ folder: { id: FOLDER_ID } });
    });

    it("does NOT apply any folder constraint when filter.ids is provided (fix for cross-folder lookups)", async () => {
        const { service, andWhereArgs, hasFolderConstraint } = createServiceWithMockQueryBuilder();

        await call(service, { filter: { ids: [FILE_ID_A, FILE_ID_B] } });

        expect(hasFolderConstraint()).toBe(false);
        expect(andWhereArgs).toContainEqual({ id: { $in: [FILE_ID_A, FILE_ID_B] } });
    });

    it("ignores an explicitly passed folderId when filter.ids is also provided", async () => {
        const { service, hasFolderConstraint } = createServiceWithMockQueryBuilder();

        await call(service, { folderId: FOLDER_ID, filter: { ids: [FILE_ID_A] } });

        expect(hasFolderConstraint()).toBe(false);
    });

    it("still applies the folder default when filter.ids is an empty array (treated as no ids filter)", async () => {
        const { service, andWhereArgs } = createServiceWithMockQueryBuilder();

        await call(service, { filter: { ids: [] } });

        expect(andWhereArgs).toContainEqual({ folder: { id: null } });
    });

    it("drops the folder constraint when searchText is provided (regression guard for existing behavior)", async () => {
        const { service, hasFolderConstraint } = createServiceWithMockQueryBuilder();

        await call(service, { filter: { searchText: "logo" } });

        expect(hasFolderConstraint()).toBe(false);
    });
});
