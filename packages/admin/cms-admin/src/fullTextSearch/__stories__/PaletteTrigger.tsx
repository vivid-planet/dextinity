import { Search } from "@dextinity/admin-icons";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { Kbd } from "./shared/SearchPanelParts";
import { isMacPlatform } from "./shared/useSearchShortcut";

const shortcutLetter = "K";

export function PaletteTrigger({ onClick }: { onClick: () => void }) {
    return (
        <Trigger onClick={onClick}>
            <Search fontSize="small" />
            <TriggerLabel variant="body2">
                <FormattedMessage id="fullTextSearchPrototype.placeholder" defaultMessage="Search…" />
            </TriggerLabel>
            <TriggerKbd>{isMacPlatform() ? "⌘" : "Ctrl"}</TriggerKbd>
            <TriggerKbd>{shortcutLetter}</TriggerKbd>
        </Trigger>
    );
}

const Trigger = styled("button")`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
    width: 280px;
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

const TriggerLabel = styled(Typography)`
    flex-grow: 1;
    text-align: left;
`;

const TriggerKbd = styled(Kbd)`
    margin: 0;
    border-color: rgba(255, 255, 255, 0.25);
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
`;
