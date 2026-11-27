import { Search } from "@dextinity/admin-icons";
import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";

interface FullTextSearchMessageProps {
    title: ReactNode;
    hint: ReactNode;
}

export function FullTextSearchMessage({ title, hint }: FullTextSearchMessageProps) {
    return (
        <Root spacing={1}>
            <Search color="disabled" fontSize="large" />
            <Typography variant="body1">{title}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {hint}
            </Typography>
        </Root>
    );
}

const Root = styled(Stack)`
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing(8, 4)};
    text-align: center;
`;
