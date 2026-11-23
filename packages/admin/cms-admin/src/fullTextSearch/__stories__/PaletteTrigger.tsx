import { Tooltip } from "@dextinity/admin";
import { Search } from "@dextinity/admin-icons";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { isMacPlatform } from "./shared/useSearchShortcut";

export function PaletteTrigger({ onClick }: { onClick: () => void }) {
    return (
        <Tooltip
            title={
                <FormattedMessage
                    id="fullTextSearchPrototype.trigger.tooltip"
                    defaultMessage="Search ({shortcut})"
                    values={{ shortcut: isMacPlatform() ? "⌘K" : "Ctrl+K" }}
                />
            }
        >
            <Trigger onClick={onClick}>
                <Search fontSize="small" />
                <Typography variant="body2">
                    <FormattedMessage id="fullTextSearchPrototype.placeholder" defaultMessage="Search…" />
                </Typography>
            </Trigger>
        </Tooltip>
    );
}

const Trigger = styled("button")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
    width: 160px;
    margin-right: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1, 1.5)};
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 2}px;
    background-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font: inherit;
    transition: ${({ theme }) => theme.transitions.create("background-color")};

    &:hover,
    &:focus-visible {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;
