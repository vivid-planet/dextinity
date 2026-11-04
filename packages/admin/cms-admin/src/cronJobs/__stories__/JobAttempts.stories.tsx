import type { Meta, StoryObj } from "@storybook/react-vite";

import { JobAttempts } from "../JobAttempts";

const config: Meta<typeof JobAttempts> = {
    component: JobAttempts,
    title: "cronJobs/JobAttempts",
};

export default config;

type Story = StoryObj<typeof config>;

const oomKilledAttempt = {
    podName: "channel-migration-29365020-abcde",
    startedAt: "2026-11-03T10:00:00Z",
    finishedAt: "2026-11-03T10:04:00Z",
    terminationReason: "OOMKilled",
    exitCode: 137,
};

export const Succeeded: Story = {
    args: {
        job: {
            failureReason: null,
            failureMessage: null,
            attempts: [{ ...oomKilledAttempt, terminationReason: "Completed", exitCode: 0 }],
        },
    },
};

export const RetriedAfterOomKill: Story = {
    args: {
        job: {
            failureReason: null,
            failureMessage: null,
            attempts: [
                oomKilledAttempt,
                {
                    podName: "channel-migration-29365020-fghij",
                    startedAt: "2026-11-03T10:04:10Z",
                    finishedAt: null,
                    terminationReason: null,
                    exitCode: null,
                },
            ],
        },
    },
};

export const FailedAfterRetries: Story = {
    args: {
        job: {
            failureReason: "BackoffLimitExceeded",
            failureMessage: "Job has reached the specified backoff limit",
            attempts: [oomKilledAttempt, { ...oomKilledAttempt, podName: "channel-migration-29365020-fghij" }],
        },
    },
};

export const DeadlineExceeded: Story = {
    args: {
        job: {
            failureReason: "DeadlineExceeded",
            failureMessage: "Job was active longer than specified deadline",
            attempts: [{ ...oomKilledAttempt, terminationReason: "DeadlineExceeded", exitCode: 143 }],
        },
    },
};
