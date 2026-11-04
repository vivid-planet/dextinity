import type { V1Job, V1Pod } from "@kubernetes/client-node";
import { describe, expect, it } from "vitest";

import {
    formatAttemptLogFooter,
    formatAttemptLogHeader,
    formatJobFailedLogLine,
    getJobAttempt,
    getJobAttempts,
    getJobFailedCondition,
    groupPodsByJobName,
} from "./kubernetes-job-attempts";

function createPod({
    name,
    jobName = "migration-1",
    createdAt,
    reason,
    containers = [],
}: {
    name: string;
    jobName?: string;
    createdAt: string;
    reason?: string;
    containers?: Array<{ reason: string; exitCode: number; finishedAt: string } | undefined>;
}): V1Pod {
    return {
        metadata: { name, labels: { "job-name": jobName }, creationTimestamp: new Date(createdAt) },
        status: {
            startTime: new Date(createdAt),
            reason,
            containerStatuses: containers.map((terminated, index) => ({
                name: `container-${index}`,
                image: "image",
                imageID: "image",
                ready: false,
                restartCount: 0,
                state: terminated ? { terminated: { ...terminated, finishedAt: new Date(terminated.finishedAt) } } : { running: {} },
            })),
        },
    };
}

describe("kubernetes-job-attempts", () => {
    describe("getJobAttempts", () => {
        it("should sort attempts by creation time", () => {
            const pods = [
                createPod({ name: "retry", createdAt: "2026-11-03T10:05:00Z" }),
                createPod({ name: "first", createdAt: "2026-11-03T10:00:00Z" }),
            ];
            expect(getJobAttempts(pods).map((attempt) => attempt.podName)).toEqual(["first", "retry"]);
        });
    });

    describe("getJobAttempt", () => {
        it("should return the termination reason and exit code of an OOM-killed container", () => {
            const pod = createPod({
                name: "first",
                createdAt: "2026-11-03T10:00:00Z",
                containers: [{ reason: "OOMKilled", exitCode: 137, finishedAt: "2026-11-03T10:04:00Z" }],
            });
            expect(getJobAttempt(pod)).toEqual({
                podName: "first",
                startedAt: new Date("2026-11-03T10:00:00Z"),
                finishedAt: new Date("2026-11-03T10:04:00Z"),
                terminationReason: "OOMKilled",
                exitCode: 137,
            });
        });

        it("should prefer an abnormally terminated container over a normally terminated sidecar", () => {
            const pod = createPod({
                name: "first",
                createdAt: "2026-11-03T10:00:00Z",
                containers: [
                    { reason: "Completed", exitCode: 0, finishedAt: "2026-11-03T10:04:01Z" },
                    { reason: "Error", exitCode: 1, finishedAt: "2026-11-03T10:04:00Z" },
                ],
            });
            expect(getJobAttempt(pod)).toMatchObject({ terminationReason: "Error", exitCode: 1 });
        });

        it("should prefer the Pod's reason", () => {
            const pod = createPod({
                name: "first",
                createdAt: "2026-11-03T10:00:00Z",
                reason: "DeadlineExceeded",
                containers: [{ reason: "Error", exitCode: 143, finishedAt: "2026-11-03T10:04:00Z" }],
            });
            expect(getJobAttempt(pod)).toMatchObject({ terminationReason: "DeadlineExceeded", exitCode: 143 });
        });

        it("should return no termination for a running Pod", () => {
            const pod = createPod({ name: "first", createdAt: "2026-11-03T10:00:00Z", containers: [undefined] });
            expect(getJobAttempt(pod)).toMatchObject({ terminationReason: undefined, exitCode: undefined, finishedAt: undefined });
        });
    });

    describe("groupPodsByJobName", () => {
        it("should group pods by the job-name label", () => {
            const pods = [
                createPod({ name: "a-1", jobName: "a", createdAt: "2026-11-03T10:00:00Z" }),
                createPod({ name: "b-1", jobName: "b", createdAt: "2026-11-03T10:00:00Z" }),
                createPod({ name: "a-2", jobName: "a", createdAt: "2026-11-03T10:05:00Z" }),
            ];
            const podsByJobName = groupPodsByJobName(pods);
            expect(podsByJobName.get("a")?.map((pod) => pod.metadata?.name)).toEqual(["a-1", "a-2"]);
            expect(podsByJobName.get("b")?.map((pod) => pod.metadata?.name)).toEqual(["b-1"]);
        });
    });

    describe("getJobFailedCondition", () => {
        it("should return the Failed condition with status True", () => {
            const job: V1Job = {
                status: {
                    conditions: [
                        { type: "FailureTarget", status: "True", reason: "BackoffLimitExceeded" },
                        { type: "Failed", status: "True", reason: "BackoffLimitExceeded", message: "Job has reached the specified backoff limit" },
                    ],
                },
            };
            expect(getJobFailedCondition(job)).toMatchObject({ type: "Failed", reason: "BackoffLimitExceeded" });
        });

        it("should ignore a Failed condition with status False", () => {
            expect(getJobFailedCondition({ status: { conditions: [{ type: "Failed", status: "False" }] } })).toBeUndefined();
        });
    });

    describe("log lines", () => {
        const attempt = {
            podName: "migration-1-abcde",
            startedAt: new Date("2026-11-03T10:00:00Z"),
            finishedAt: new Date("2026-11-03T10:04:00Z"),
            terminationReason: "OOMKilled",
            exitCode: 137,
        };

        it("should format the header", () => {
            expect(formatAttemptLogHeader(attempt, 1, 2)).toBe("===== Attempt 1/2: pod migration-1-abcde, started 2026-11-03T10:00:00.000Z =====");
        });

        it("should format the footer of a terminated attempt", () => {
            expect(formatAttemptLogFooter(attempt, 1, 2)).toBe(
                "===== Attempt 1/2 ended: OOMKilled, exit code 137, finished 2026-11-03T10:04:00.000Z =====",
            );
        });

        it("should format the footer of a running attempt", () => {
            expect(formatAttemptLogFooter({ podName: "migration-1-fghij" }, 2, 2)).toBe("===== Attempt 2/2: still running =====");
        });

        it("should format the Failed condition", () => {
            expect(
                formatJobFailedLogLine({
                    type: "Failed",
                    status: "True",
                    reason: "DeadlineExceeded",
                    message: "Job was active longer than specified deadline",
                }),
            ).toBe("===== Job failed: DeadlineExceeded (Job was active longer than specified deadline) =====");
        });
    });
});
