import { styled } from "@mui/material/styles";

import type { GQLKubernetesJobStatus } from "../graphql.generated";

export const JobStatus = styled("div")<{ status: GQLKubernetesJobStatus }>`
    color: ${({ theme, status }) => {
        if (status === "succeeded") {
            return theme.palette.success.main;
        } else if (status === "failed") {
            return theme.palette.error.main;
        }

        return theme.palette.primary.main;
    }};
`;
