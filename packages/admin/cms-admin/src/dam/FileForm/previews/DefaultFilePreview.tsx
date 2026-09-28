import { File } from "@dextinity/admin-icons";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ReactElement } from "react";

const OtherFilePreviewWrapper = styled("div")`
    width: 100%;
    min-height: 400px;
    background-color: ${({ theme }) => theme.palette.grey[50]};

    display: flex;
    justify-content: center;
    align-items: center;
`;

const IconWrapper = styled(Box)`
    width: 150px;
    height: 150px;
    background: white;
    border-radius: 10px;

    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
`;

const DocumentIcon = styled(File)`
    color: ${({ theme }) => theme.palette.primary.main};
    width: 54px;
    height: 72px;
`;

interface OtherFilePreviewProps {
    customIcon?: ReactElement;
}

export const DefaultFilePreview = ({ customIcon }: OtherFilePreviewProps) => {
    return (
        <OtherFilePreviewWrapper>
            <IconWrapper>{customIcon ?? <DocumentIcon />}</IconWrapper>
        </OtherFilePreviewWrapper>
    );
};
