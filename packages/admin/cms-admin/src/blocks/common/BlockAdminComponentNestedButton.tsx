import { Button } from "@dextinity/admin";
import { Edit, Warning } from "@dextinity/admin-icons";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { MouseEventHandler, ReactNode } from "react";

import { BlockAdminComponentPaper } from "./BlockAdminComponentPaper";
import { usePromise } from "./usePromise";

interface Props {
    displayName: ReactNode;
    preview: ReactNode;
    count?: number;
    onClick?: MouseEventHandler<HTMLElement>;
    isValid?: () => Promise<boolean> | boolean;
}

export const BlockAdminComponentNestedButton = ({ displayName, preview, count, onClick, isValid: isValidFn }: Props) => {
    const isValid = usePromise(isValidFn, { initialValue: true });

    return (
        <BlockAdminComponentPaper disablePadding>
            <Button onClick={onClick} fullWidth endIcon={<Edit />} variant="textDark">
                <TextContainer>
                    <Typography variant="body1" align="left" noWrap>
                        {!isValid && <Warning color="error" />}
                        {displayName}
                        {count !== undefined && ` (${count})`}
                    </Typography>
                    <Typography variant="body2" align="left" color="textSecondary" noWrap>
                        {preview}
                    </Typography>
                </TextContainer>
            </Button>
        </BlockAdminComponentPaper>
    );
};

const TextContainer = styled("span")`
    min-width: 0;
    flex: 1;
`;
