import { styled } from "@mui/material/styles";

export const CronJobRunsContent = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--dextinity-space-3);

    & > :not(button, a) {
        align-self: stretch;
    }
`;

export const CronJobRuns = styled("ul")`
    margin: 0;
    padding: 0;
    list-style: none;
`;
