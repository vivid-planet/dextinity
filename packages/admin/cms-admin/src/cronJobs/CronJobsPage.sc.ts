import { ListDetailLayout } from "@dextinity/ui";
import { styled } from "@mui/material/styles";

export const CronJobsLayout = styled(ListDetailLayout)`
    &[data-logs] {
        --dextinity-list-detail-layout-panel-width: minmax(420px, 55%);
    }
`;

export const LastJobRunCell = styled("span")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-space-1);
    min-inline-size: 0;
`;
