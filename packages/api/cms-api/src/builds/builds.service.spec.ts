import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KubernetesModule } from "../kubernetes/kubernetes.module";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants";
import { BuildTemplatesService } from "./build-templates.service";
import { CONTENT_SCOPE_ANNOTATION } from "./builds.constants";
import { BuildsService } from "./builds.service";
import { ChangesSinceLastBuild } from "./entities/changes-since-last-build.entity";

const jobMain = {
    metadata: {
        name: "main",
        annotations: {
            [CONTENT_SCOPE_ANNOTATION]: '{"domain":"main"}',
        },
    },
};

const jobMainEnglish = {
    metadata: {
        name: "main-en",
        annotations: {
            [CONTENT_SCOPE_ANNOTATION]: '{"domain":"main","language":"en"}',
        },
    },
};

const jobMainEnglish2 = {
    metadata: {
        name: "main-en-2",
        annotations: {
            [CONTENT_SCOPE_ANNOTATION]: '{"domain":"main","language":"en"}',
        },
    },
};

const jobMainGerman = {
    metadata: {
        name: "main-de",
        annotations: {
            [CONTENT_SCOPE_ANNOTATION]: '{"domain":"main","language":"de"}',
        },
    },
};

const mockedBuildTemplatesService = {
    getAllBuilderCronJobs: vi.fn().mockResolvedValue([jobMainEnglish, jobMainGerman]),
};

vi.mock("@kubernetes/client-node", () => ({}));

describe("BuildsService", () => {
    let service: BuildsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [KubernetesModule.register({ helmRelease: "test" })],
            providers: [
                BuildsService,
                { provide: getRepositoryToken(ChangesSinceLastBuild), useValue: {} },
                { provide: BuildTemplatesService, useValue: mockedBuildTemplatesService },
                { provide: ACCESS_CONTROL_SERVICE, useValue: {} },
                { provide: EntityManager, useValue: {} },
            ],
        }).compile();

        service = module.get<BuildsService>(BuildsService);
    });

    describe("getBuilderCronJobsToStart", () => {
        it("should return single job for exact match", async () => {
            await expect(service.getBuilderCronJobsToStart([{ domain: "main", language: "en" }])).resolves.toEqual([jobMainEnglish]);
        });

        it("should return two jobs if two jobs have the exact same scope", async () => {
            mockedBuildTemplatesService.getAllBuilderCronJobs.mockResolvedValueOnce([jobMainEnglish, jobMainEnglish2]);
            await expect(service.getBuilderCronJobsToStart([{ domain: "main", language: "en" }])).resolves.toEqual([jobMainEnglish, jobMainEnglish2]);
        });

        it("should return multiple jobs for multiple exact matches", async () => {
            await expect(
                service.getBuilderCronJobsToStart([
                    { domain: "main", language: "en" },
                    { domain: "main", language: "de" },
                ]),
            ).resolves.toEqual([jobMainEnglish, jobMainGerman]);
        });

        it("should return all partially matching jobs", async () => {
            await expect(service.getBuilderCronJobsToStart([{ domain: "main" }])).resolves.toEqual([jobMainEnglish, jobMainGerman]);

            // Multiple content scopes in a single builder cron job.
            mockedBuildTemplatesService.getAllBuilderCronJobs.mockResolvedValueOnce([jobMain]);
            await expect(
                service.getBuilderCronJobsToStart([
                    { domain: "main", language: "en" },
                    { domain: "main", language: "de" },
                ]),
            ).resolves.toEqual([jobMain]);
        });

        it("should throw an error if no job is found", async () => {
            await expect(service.getBuilderCronJobsToStart([{ domain: "tertiary" }])).rejects.toThrow(
                'Found changes in scope {"domain":"tertiary"} but no matching builder cron job!',
            );
        });
    });
});
