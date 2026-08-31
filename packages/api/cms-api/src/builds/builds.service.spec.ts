import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { Test, type TestingModule } from "@nestjs/testing";
import parser from "cron-parser";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KubernetesModule } from "../kubernetes/kubernetes.module";
import type { CurrentUser } from "../user-permissions/dto/current-user";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants";
import { BuildTemplatesService } from "./build-templates.service";
import { CONTENT_SCOPE_ANNOTATION } from "./builds.constants";
import { BuildsService } from "./builds.service";
import { ChangesSinceLastBuild } from "./entities/changes-since-last-build.entity";

const currentUser = {} as CurrentUser;

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
    getAllowedBuilderCronJobs: vi.fn(),
};

const mockedChangesRepository = {
    count: vi.fn().mockResolvedValue(0),
};

vi.mock("@kubernetes/client-node", () => ({}));

describe("BuildsService", () => {
    let service: BuildsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [KubernetesModule.register({ helmRelease: "test" })],
            providers: [
                BuildsService,
                { provide: getRepositoryToken(ChangesSinceLastBuild), useValue: mockedChangesRepository },
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

    describe("getAutoBuildStatus", () => {
        it("should use the earliest next scheduled run across all allowed cron jobs", async () => {
            const hourlyCronJob = { spec: { schedule: "0 * * * *" }, status: {} };
            const everyFiveMinutesCronJob = { spec: { schedule: "*/5 * * * *" }, status: {} };
            mockedBuildTemplatesService.getAllowedBuilderCronJobs.mockResolvedValueOnce([hourlyCronJob, everyFiveMinutesCronJob]);

            const expectedNextCheck = parser.parseExpression(everyFiveMinutesCronJob.spec.schedule).next().toDate();

            const autoBuildStatus = await service.getAutoBuildStatus(currentUser);

            expect(autoBuildStatus.nextCheck).toEqual(expectedNextCheck);
        });

        it("should use the most recent lastScheduleTime across all allowed cron jobs", async () => {
            const olderCronJob = { spec: { schedule: "0 * * * *" }, status: { lastScheduleTime: new Date("2024-01-01T00:00:00Z") } };
            const newerCronJob = { spec: { schedule: "0 * * * *" }, status: { lastScheduleTime: new Date("2024-01-02T00:00:00Z") } };
            mockedBuildTemplatesService.getAllowedBuilderCronJobs.mockResolvedValueOnce([olderCronJob, newerCronJob]);

            const autoBuildStatus = await service.getAutoBuildStatus(currentUser);

            expect(autoBuildStatus.lastCheck).toEqual(newerCronJob.status.lastScheduleTime);
        });

        it("should leave lastCheck undefined if no cron job has been scheduled yet", async () => {
            const cronJob = { spec: { schedule: "0 * * * *" }, status: {} };
            mockedBuildTemplatesService.getAllowedBuilderCronJobs.mockResolvedValueOnce([cronJob]);

            const autoBuildStatus = await service.getAutoBuildStatus(currentUser);

            expect(autoBuildStatus.lastCheck).toBeUndefined();
        });

        it("should throw an error if no allowed cron job is found", async () => {
            mockedBuildTemplatesService.getAllowedBuilderCronJobs.mockResolvedValueOnce([]);

            await expect(service.getAutoBuildStatus(currentUser)).rejects.toThrow("BuildChecker CronJob not found.");
        });
    });
});
