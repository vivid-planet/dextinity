import type { CoreV1Api, V1Pod } from "@kubernetes/client-node";
import { describe, expect, it, vi } from "vitest";

import { KubernetesJobStatus } from "./job-status.enum";
import { KubernetesService } from "./kubernetes.service";

vi.mock("@kubernetes/client-node", () => ({}));

function createService(pods: V1Pod[], logs: Record<string, string>) {
    const service = new KubernetesService({ helmRelease: "test" });
    service.namespace = "test";
    service.coreApi = {
        listNamespacedPod: vi.fn().mockResolvedValue({ items: pods }),
        readNamespacedPodLog: vi.fn(async ({ name }: { name: string }) => logs[name]),
    } as unknown as CoreV1Api;
    return service;
}

describe("KubernetesService", () => {
    describe("getStatusForKubernetesJob", () => {
        const service = new KubernetesService({ helmRelease: "test" });

        it("should be pending before the first pod starts", () => {
            expect(service.getStatusForKubernetesJob({ status: {} })).toBe(KubernetesJobStatus.pending);
        });

        it("should be active while a pod is running", () => {
            expect(service.getStatusForKubernetesJob({ status: { active: 1, failed: 1 } })).toBe(KubernetesJobStatus.active);
        });

        it("should be pending while a failed attempt waits for its retry", () => {
            expect(service.getStatusForKubernetesJob({ status: { failed: 1 } })).toBe(KubernetesJobStatus.pending);
        });

        it("should be succeeded if a retry succeeded", () => {
            expect(
                service.getStatusForKubernetesJob({ status: { failed: 1, succeeded: 1, conditions: [{ type: "Complete", status: "True" }] } }),
            ).toBe(KubernetesJobStatus.succeeded);
        });

        it("should be failed once the job has the Failed condition", () => {
            expect(
                service.getStatusForKubernetesJob({
                    status: { failed: 2, conditions: [{ type: "Failed", status: "True", reason: "BackoffLimitExceeded" }] },
                }),
            ).toBe(KubernetesJobStatus.failed);
        });

        it("should be failed while the pods of a failed job are still terminating", () => {
            expect(
                service.getStatusForKubernetesJob({
                    status: { failed: 1, conditions: [{ type: "FailureTarget", status: "True", reason: "DeadlineExceeded" }] },
                }),
            ).toBe(KubernetesJobStatus.failed);
        });
    });

    describe("getJobLogs", () => {
        it("should separate the attempts and show why they ended", async () => {
            const retryPod: V1Pod = {
                metadata: { name: "migration-1-fghij", creationTimestamp: new Date("2026-11-03T10:05:00Z") },
                status: { startTime: new Date("2026-11-03T10:05:00Z") },
            };
            const oomKilledPod: V1Pod = {
                metadata: { name: "migration-1-abcde", creationTimestamp: new Date("2026-11-03T10:00:00Z") },
                status: {
                    startTime: new Date("2026-11-03T10:00:00Z"),
                    containerStatuses: [
                        {
                            name: "job",
                            image: "image",
                            imageID: "image",
                            ready: false,
                            restartCount: 0,
                            state: { terminated: { reason: "OOMKilled", exitCode: 137, finishedAt: new Date("2026-11-03T10:04:00Z") } },
                        },
                    ],
                },
            };
            const service = createService([retryPod, oomKilledPod], {
                "migration-1-abcde": "Migrating channels\n",
                "migration-1-fghij": "Migrating channels\n",
            });

            const logs = await service.getJobLogs({
                metadata: { name: "migration-1" },
                status: {
                    conditions: [
                        { type: "Failed", status: "True", reason: "DeadlineExceeded", message: "Job was active longer than specified deadline" },
                    ],
                },
            });

            expect(logs).toBe(
                [
                    "===== Attempt 1/2: pod migration-1-abcde, started 2026-11-03T10:00:00.000Z =====",
                    "Migrating channels",
                    "===== Attempt 1/2 ended: OOMKilled, exit code 137, finished 2026-11-03T10:04:00.000Z =====",
                    "===== Attempt 2/2: pod migration-1-fghij, started 2026-11-03T10:05:00.000Z =====",
                    "Migrating channels",
                    "===== Attempt 2/2: still running =====",
                    "===== Job failed: DeadlineExceeded (Job was active longer than specified deadline) =====",
                    "",
                ].join("\n"),
            );
        });
    });

    describe("getPodsForJobs", () => {
        it("should request the pods of all jobs at once and group them by job", async () => {
            const service = createService(
                [{ metadata: { name: "a-1", labels: { "job-name": "a" } } }, { metadata: { name: "b-1", labels: { "job-name": "b" } } }],
                {},
            );

            const podsByJobName = await service.getPodsForJobs([{ metadata: { name: "a" } }, { metadata: { name: "b" } }]);

            expect(service.coreApi.listNamespacedPod).toHaveBeenCalledTimes(1);
            expect(service.coreApi.listNamespacedPod).toHaveBeenCalledWith({ namespace: "test", labelSelector: "job-name in (a,b)" });
            expect(podsByJobName.get("a")?.map((pod) => pod.metadata?.name)).toEqual(["a-1"]);
            expect(podsByJobName.get("b")?.map((pod) => pod.metadata?.name)).toEqual(["b-1"]);
        });

        it("should not request pods without jobs", async () => {
            const service = createService([], {});
            expect(await service.getPodsForJobs([])).toEqual(new Map());
            expect(service.coreApi.listNamespacedPod).not.toHaveBeenCalled();
        });
    });
});
