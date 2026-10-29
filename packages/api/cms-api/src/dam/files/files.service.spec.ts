import type { EntityManager, EntityRepository, MikroORM, QueryBuilder } from "@mikro-orm/postgresql";
import { Logger } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FocalPoint } from "../../file-utils/focal-point.enum";
import type { DamConfig } from "../dam.config";
import type { ImageCropArea } from "../images/entities/image-crop-area.entity";
import { damSettingsByScope } from "../settings/dam-settings-by-scope";
import { DamSettings } from "../settings/entities/dam-settings.entity";
import type { FileFilterInput } from "./dto/file.args";
import type { FileInterface } from "./entities/file.entity";
import type { DamFileImage } from "./entities/file-image.entity";
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

describe("FilesService.saveDominantColor", () => {
    const IMAGE_ID = "44444444-4444-4444-4444-444444444444";

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createServiceWithMockEntityManager({ flush }: { flush: () => Promise<void> }) {
        const image: { dominantColor?: string } = {};
        const entityManager = { findOneOrFail: vi.fn().mockResolvedValue(image), flush: vi.fn(flush) };
        const orm = { em: { fork: () => entityManager } } as unknown as MikroORM;

        const service = new FilesService(
            null as never, // filesRepository
            null as never, // damMediaAlternativesRepository
            null as never, // blobStorageBackendService
            null as never, // foldersService
            null as never, // DAM_CONFIG
            orm,
            null as never, // entityManager
        );

        return { service, image, entityManager };
    }

    it("saves the calculated dominant color", async () => {
        const { service, image, entityManager } = createServiceWithMockEntityManager({ flush: () => Promise.resolve() });
        const dominantColorCalculator = { calculateDominantColor: vi.fn().mockResolvedValue("#ff0000") };

        await service["saveDominantColor"]({ imageId: IMAGE_ID, contentHash: "content-hash", dominantColorCalculator });

        expect(image.dominantColor).toBe("#ff0000");
        expect(entityManager.flush).toHaveBeenCalled();
    });

    it("logs instead of rejecting when the calculation fails", async () => {
        const loggerErrorSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        const { service, entityManager } = createServiceWithMockEntityManager({ flush: () => Promise.resolve() });
        const dominantColorCalculator = { calculateDominantColor: vi.fn().mockRejectedValue(new Error("imgproxy failed")) };

        await expect(
            service["saveDominantColor"]({ imageId: IMAGE_ID, contentHash: "content-hash", dominantColorCalculator }),
        ).resolves.toBeUndefined();

        expect(entityManager.flush).not.toHaveBeenCalled();
        expect(loggerErrorSpy).toHaveBeenCalledWith(`Failed to save dominant color for image ${IMAGE_ID}`, expect.any(Error));
    });

    it("logs instead of rejecting when saving fails", async () => {
        const loggerErrorSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        const { service } = createServiceWithMockEntityManager({ flush: () => Promise.reject(new Error("flush failed")) });
        const dominantColorCalculator = { calculateDominantColor: vi.fn().mockResolvedValue("#ff0000") };

        await expect(
            service["saveDominantColor"]({ imageId: IMAGE_ID, contentHash: "content-hash", dominantColorCalculator }),
        ).resolves.toBeUndefined();

        expect(loggerErrorSpy).toHaveBeenCalledWith(`Failed to save dominant color for image ${IMAGE_ID}`, expect.any(Error));
    });
});

describe("FilesService — invalid licenses", () => {
    const expiredLicense = { durationTo: new Date("2020-01-01") };
    const notYetValidLicense = { durationFrom: new Date("2999-01-01") };
    const validLicense = { durationTo: new Date("2999-01-01") };
    const scope = { domain: "main" };

    function createService({
        enableLicenseFeature = true,
        settings = null,
    }: { enableLicenseFeature?: boolean; settings?: { invalidLicenseFallbackImage?: { load: () => Promise<FileInterface> } } | null } = {}) {
        const entityManager = { findOne: vi.fn().mockResolvedValue(settings) };

        const service = new FilesService(
            null as never, // filesRepository
            null as never, // damMediaAlternativesRepository
            null as never, // blobStorageBackendService
            null as never, // foldersService
            { enableLicenseFeature } as DamConfig,
            null as never, // orm
            entityManager as unknown as EntityManager,
        );

        return { service, entityManager };
    }

    function createSettingsWithFallbackImage(fallbackImage: Partial<FileInterface>) {
        return { invalidLicenseFallbackImage: { load: () => Promise.resolve(fallbackImage as FileInterface) } };
    }

    it.each([
        { case: "the license has expired", enableLicenseFeature: true, license: expiredLicense, expected: true },
        { case: "the license isn't valid yet", enableLicenseFeature: true, license: notYetValidLicense, expected: true },
        { case: "the license is valid", enableLicenseFeature: true, license: validLicense, expected: false },
        { case: "the file has no license", enableLicenseFeature: true, license: undefined, expected: false },
        { case: "the license feature is disabled", enableLicenseFeature: false, license: expiredLicense, expected: false },
    ])("hasInvalidLicense returns $expected when $case", ({ enableLicenseFeature, license, expected }) => {
        const { service } = createService({ enableLicenseFeature });

        expect(service.hasInvalidLicense({ license } as FileInterface)).toBe(expected);
    });

    it.each([
        { previewDamUrls: false, expected: true },
        { previewDamUrls: true, expected: false },
    ])("isBlockedByLicense returns $expected for an invalid license with previewDamUrls: $previewDamUrls", ({ previewDamUrls, expected }) => {
        const { service } = createService();

        expect(service.isBlockedByLicense({ license: expiredLicense } as FileInterface, { previewDamUrls })).toBe(expected);
    });

    const cropArea = { focalPoint: FocalPoint.CENTER, width: 50, height: 50, x: 25, y: 25 } as ImageCropArea;
    const imageWithValidLicense = { file: { id: FILE_ID_B, scope, license: validLicense } as unknown as FileInterface, cropArea };
    const imageWithInvalidLicense = { file: { id: FILE_ID_B, scope, license: expiredLicense } as unknown as FileInterface, cropArea };

    it("delivers the image itself, including its crop area, when its license is valid", async () => {
        const { service } = createService();

        await expect(service.findImageToDeliver(imageWithValidLicense, {})).resolves.toBe(imageWithValidLicense);
    });

    it("delivers the image itself for the Admin, even when its license is invalid", async () => {
        const { service } = createService();

        await expect(service.findImageToDeliver(imageWithInvalidLicense, { previewDamUrls: true })).resolves.toBe(imageWithInvalidLicense);
    });

    it("delivers the fallback image of the image's scope, without the crop area, when its license is invalid", async () => {
        const fallbackImage = { id: FILE_ID_A, image: {}, license: validLicense } as Partial<FileInterface>;
        const { service, entityManager } = createService({ settings: createSettingsWithFallbackImage(fallbackImage) });

        await expect(service.findImageToDeliver(imageWithInvalidLicense, {})).resolves.toEqual({ file: fallbackImage });
        expect(entityManager.findOne).toHaveBeenCalledWith(DamSettings, damSettingsByScope(scope));
    });

    it.each([
        { case: "no settings exist for the scope", settings: null },
        { case: "no fallback image is set", settings: {} },
        { case: "the fallback image isn't a pixel image", settings: createSettingsWithFallbackImage({ id: FILE_ID_A }) },
        {
            case: "the fallback image's license is invalid as well",
            settings: createSettingsWithFallbackImage({ id: FILE_ID_A, image: {} as DamFileImage, license: expiredLicense }),
        },
    ])("delivers no image when the license is invalid and $case", async ({ settings }) => {
        const { service } = createService({ settings });

        await expect(service.findImageToDeliver(imageWithInvalidLicense, {})).resolves.toBeNull();
    });
});
