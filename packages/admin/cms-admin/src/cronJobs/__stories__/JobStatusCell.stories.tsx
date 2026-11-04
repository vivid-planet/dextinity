import type { Meta, StoryObj } from "@storybook/react-vite";

import { JobStatusCell } from "../JobStatusCell";

const config: Meta<typeof JobStatusCell> = {
    component: JobStatusCell,
    title: "cronJobs/JobStatusCell",
};

export default config;

type Story = StoryObj<typeof config>;

const oomKilledAttempt = { podName: "channel-migration-29365020-abcde", terminationReason: "OOMKilled", exitCode: 137 };
const retryAttempt = { podName: "channel-migration-29365020-fghij", terminationReason: null, exitCode: null };

export const Succeeded: Story = {
    args: {
        job: {
            status: "succeeded",
            failureReason: null,
            failureMessage: null,
            attempts: [{ ...oomKilledAttempt, terminationReason: "Completed", exitCode: 0 }],
        },
    },
};

export const RetriedAfterOomKill: Story = {
    args: {
        job: { status: "active", failureReason: null, failureMessage: null, attempts: [oomKilledAttempt, retryAttempt] },
    },
};

export const FailedAfterRetries: Story = {
    args: {
        job: {
            status: "failed",
            failureReason: "BackoffLimitExceeded",
            failureMessage: "Job has reached the specified backoff limit",
            attempts: [oomKilledAttempt, { ...oomKilledAttempt, podName: retryAttempt.podName }],
        },
    },
};

export const DeadlineExceeded: Story = {
    args: {
        job: {
            status: "failed",
            failureReason: "DeadlineExceeded",
            failureMessage: "Job was active longer than specified deadline",
            attempts: [{ ...oomKilledAttempt, terminationReason: "DeadlineExceeded", exitCode: 143 }],
        },
    },
};
