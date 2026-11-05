import { gql } from "@apollo/client";
import { GridCellContent, Tooltip } from "@dextinity/admin";
import { styled } from "@mui/material/styles";
import { Fragment, type ReactNode } from "react";
import { defineMessages, FormattedMessage } from "react-intl";

import { JobStatus } from "./JobStatus";
import type { GQLJobStatusCellFragment } from "./JobStatusCell.generated";

export const jobStatusCellFragment = gql`
    fragment JobStatusCell on KubernetesJob {
        status
        failureReason
        failureMessage
        attempts {
            podName
            terminationReason
            exitCode
        }
    }
`;

type JobStatusCellProps = {
    job: GQLJobStatusCellFragment;
};

export function JobStatusCell({ job }: JobStatusCellProps) {
    const details = getDetails(job);

    const cellContent = (
        <GridCellContent
            primaryText={
                <JobStatus as="span" status={job.status}>
                    {job.status}
                </JobStatus>
            }
            secondaryText={details.length > 0 ? <DetailsList details={details} highlightErrors /> : undefined}
        />
    );

    if (details.length === 0) {
        return cellContent;
    }

    return (
        <Tooltip
            title={
                <>
                    <DetailsList details={details} />
                    {job.failureMessage && (
                        <>
                            <br />
                            {job.failureMessage}
                        </>
                    )}
                </>
            }
        >
            <TooltipAnchor>{cellContent}</TooltipAnchor>
        </Tooltip>
    );
}

type Detail = {
    key: string;
    content: ReactNode;
    isError?: boolean;
};

function DetailsList({ details, highlightErrors }: { details: Detail[]; highlightErrors?: boolean }) {
    return details.map(({ key, content, isError }, index) => (
        <Fragment key={key}>
            {index > 0 && " • "}
            {highlightErrors && isError ? <ErrorText>{content}</ErrorText> : content}
        </Fragment>
    ));
}

function getDetails({ attempts, failureReason }: GQLJobStatusCellFragment): Detail[] {
    const details: Detail[] = [];

    if (attempts.length > 1) {
        details.push({
            key: "attempts",
            content: (
                <FormattedMessage
                    id="dextinity.jobs.attempts"
                    defaultMessage="{count, plural, one {# attempt} other {# attempts}}"
                    values={{ count: attempts.length }}
                />
            ),
        });
    }

    for (const { terminationReason, exitCode, count } of groupAbnormalTerminations(attempts)) {
        details.push({
            key: `termination-${terminationReason}-${exitCode}`,
            content: (
                <FormattedMessage
                    id="dextinity.jobs.attemptTermination"
                    defaultMessage="{count, plural, one {} other {#× }}{reason}{exitCode, select, none {} other { (exit {exitCode})}}"
                    values={{ count, reason: terminationReason ?? "Terminated", exitCode: exitCode ?? "none" }}
                />
            ),
            isError: true,
        });
    }

    if (failureReason) {
        details.push({
            key: "failureReason",
            content: failureReason in failureReasonMessages ? <FormattedMessage {...failureReasonMessages[failureReason]} /> : failureReason,
            isError: true,
        });
    }

    return details;
}

type AbnormalTermination = {
    terminationReason: string | null;
    exitCode: number | null;
    count: number;
};

function groupAbnormalTerminations(attempts: GQLJobStatusCellFragment["attempts"]): AbnormalTermination[] {
    const terminations: AbnormalTermination[] = [];

    for (const { terminationReason, exitCode } of attempts) {
        const isRunning = terminationReason == null && exitCode == null;
        if (isRunning || exitCode === 0) {
            continue;
        }

        const existing = terminations.find((termination) => termination.terminationReason === terminationReason && termination.exitCode === exitCode);
        if (existing) {
            existing.count++;
        } else {
            terminations.push({ terminationReason, exitCode, count: 1 });
        }
    }

    return terminations;
}

const failureReasonMessages = defineMessages<string>({
    BackoffLimitExceeded: { id: "dextinity.jobs.failureReason.backoffLimitExceeded", defaultMessage: "Retry limit exceeded" },
    DeadlineExceeded: { id: "dextinity.jobs.failureReason.deadlineExceeded", defaultMessage: "Deadline exceeded" },
});

// GridCellContent doesn't forward refs, which Tooltip needs to position itself before React 19
const TooltipAnchor = styled("div")`
    height: 100%;
    min-width: 0;
`;

const ErrorText = styled("span")`
    color: ${({ theme }) => theme.palette.error.main};
`;
