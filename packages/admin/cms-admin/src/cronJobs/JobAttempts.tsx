import { gql } from "@apollo/client";
import { Tooltip } from "@dextinity/admin";
import { Chip, Stack } from "@mui/material";
import { defineMessages, FormattedMessage } from "react-intl";

import type { GQLJobAttemptsFragment } from "./JobAttempts.generated";

export const jobAttemptsFragment = gql`
    fragment JobAttempts on KubernetesJob {
        failureReason
        failureMessage
        attempts {
            podName
            startedAt
            finishedAt
            terminationReason
            exitCode
        }
    }
`;

type JobAttemptsProps = {
    job: GQLJobAttemptsFragment;
};

export function JobAttempts({ job }: JobAttemptsProps) {
    const { attempts, failureReason, failureMessage } = job;
    const abnormalTerminations = groupAbnormalTerminations(attempts);

    return (
        <Stack direction="row" spacing={1} alignItems="center" height="100%">
            {attempts.length > 0 && (
                <Chip
                    size="small"
                    label={
                        <FormattedMessage
                            id="dextinity.jobs.attempts"
                            defaultMessage="{count, plural, one {# attempt} other {# attempts}}"
                            values={{ count: attempts.length }}
                        />
                    }
                />
            )}
            {attempts.length > 1 && (
                <Chip size="small" color="warning" label={<FormattedMessage id="dextinity.jobs.retried" defaultMessage="Retried" />} />
            )}
            {abnormalTerminations.map(({ terminationReason, exitCode, attemptNumbers }) => (
                <Tooltip
                    key={`${terminationReason}-${exitCode}`}
                    title={
                        <FormattedMessage
                            id="dextinity.jobs.attemptTermination.tooltip"
                            defaultMessage="{count, plural, one {Attempt} other {Attempts}} {attemptNumbers}"
                            values={{ count: attemptNumbers.length, attemptNumbers: attemptNumbers.join(", ") }}
                        />
                    }
                >
                    <Chip
                        size="small"
                        color="error"
                        variant="outlined"
                        label={
                            <FormattedMessage
                                id="dextinity.jobs.attemptTermination"
                                defaultMessage="{count, plural, one {} other {#× }}{reason}{exitCode, select, none {} other { (exit {exitCode})}}"
                                values={{
                                    count: attemptNumbers.length,
                                    reason: terminationReason ?? "Terminated",
                                    exitCode: exitCode ?? "none",
                                }}
                            />
                        }
                    />
                </Tooltip>
            ))}
            {failureReason && (
                <Tooltip title={failureMessage}>
                    <Chip
                        size="small"
                        color="error"
                        label={
                            failureReason in failureReasonMessages ? <FormattedMessage {...failureReasonMessages[failureReason]} /> : failureReason
                        }
                    />
                </Tooltip>
            )}
        </Stack>
    );
}

type AbnormalTermination = {
    terminationReason: string | null;
    exitCode: number | null;
    attemptNumbers: number[];
};

function groupAbnormalTerminations(attempts: GQLJobAttemptsFragment["attempts"]): AbnormalTermination[] {
    const terminations: AbnormalTermination[] = [];

    attempts.forEach(({ terminationReason, exitCode }, index) => {
        const isRunning = terminationReason == null && exitCode == null;
        if (isRunning || exitCode === 0) {
            return;
        }

        const existing = terminations.find((termination) => termination.terminationReason === terminationReason && termination.exitCode === exitCode);
        if (existing) {
            existing.attemptNumbers.push(index + 1);
        } else {
            terminations.push({ terminationReason, exitCode, attemptNumbers: [index + 1] });
        }
    });

    return terminations;
}

const failureReasonMessages = defineMessages<string>({
    BackoffLimitExceeded: { id: "dextinity.jobs.failureReason.backoffLimitExceeded", defaultMessage: "Retry limit exceeded" },
    DeadlineExceeded: { id: "dextinity.jobs.failureReason.deadlineExceeded", defaultMessage: "Deadline exceeded" },
});
