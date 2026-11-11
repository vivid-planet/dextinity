import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";

type TagType = "warning" | "error" | "info" | "neutral";

interface TagProps {
    type?: TagType;
    icon?: ReactNode;
    className?: string;
}

export const Tag = ({ type, icon, children, className }: PropsWithChildren<TagProps>) => {
    return (
        <Root type={type} className={className}>
            {icon}
            <Text>{children}</Text>
        </Root>
    );
};

const Root = styled("div")<{ type?: TagType }>`
    display: flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    max-width: 100%;
    height: 20px;
    border-radius: 4px;
    padding: 4px 5px;
    box-sizing: border-box;
    font-size: 12px;
    line-height: 12px;
    color: ${({ theme, type }) => {
        switch (type) {
            case "error":
                return theme.palette.error.contrastText;
            default:
                return theme.palette.grey[800];
        }
    }};
    background-color: ${({ theme, type }) => {
        switch (type) {
            case "warning":
                return theme.palette.warning.main;
            case "error":
                return theme.palette.error.main;
            case "info":
                return theme.palette.primary.main;
            default:
                return theme.palette.grey["100"];
        }
    }};

    & > svg {
        flex-shrink: 0;
    }
`;

const Text = styled("span")`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
