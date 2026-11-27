import { Search } from "@dextinity/admin-icons";
import { ButtonBase, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import { FullTextSearchDialog } from "./FullTextSearchDialog";
import { useFullTextSearchTypes } from "./useFullTextSearchTypes";

export function SearchHeaderItem() {
    const intl = useIntl();
    const isAllowed = useUserPermissionCheck();
    const [open, setOpen] = useState(false);
    const isSearchAllowed = isAllowed("fullTextSearch");
    // Loaded before the dialog opens, so its tabs are complete when it shows
    useFullTextSearchTypes({ skip: !isSearchAllowed });

    useEffect(() => {
        if (!isSearchAllowed) {
            return;
        }

        const toggleOnShortcut = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", toggleOnShortcut);
        return () => document.removeEventListener("keydown", toggleOnShortcut);
    }, [isSearchAllowed]);

    if (!isSearchAllowed) {
        return null;
    }

    return (
        <>
            <SearchTrigger
                onClick={() => setOpen(true)}
                aria-label={intl.formatMessage({ id: "dextinity.fullTextSearch.searchLabel", defaultMessage: "Search" })}
                aria-haspopup="dialog"
                aria-keyshortcuts="Control+K Meta+K"
            >
                <Search />
                <TriggerText variant="body2">
                    <FormattedMessage id="dextinity.fullTextSearch.placeholder" defaultMessage="Search…" />
                </TriggerText>
            </SearchTrigger>
            <FullTextSearchDialog open={open} onClose={() => setOpen(false)} />
        </>
    );
}

const SearchTrigger = styled(ButtonBase)`
    height: 100%;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(0, 3)};
    color: ${({ theme }) => theme.palette.common.white};

    ${({ theme }) => theme.breakpoints.up("md")} {
        width: 240px;
        height: auto;
        margin: ${({ theme }) => theme.spacing(0, 2)};
        padding: ${({ theme }) => theme.spacing(1, 2)};
        border: 1px solid ${({ theme }) => alpha(theme.palette.common.white, 0.2)};
        border-radius: ${({ theme }) => theme.shape.borderRadius}px;
        background-color: ${({ theme }) => alpha(theme.palette.common.white, 0.1)};

        &:hover,
        &.Mui-focusVisible {
            background-color: ${({ theme }) => alpha(theme.palette.common.white, 0.2)};
        }
    }
`;

const TriggerText = styled(Typography)`
    display: none;
    flex-grow: 1;
    text-align: left;
    color: ${({ theme }) => alpha(theme.palette.common.white, 0.7)};

    ${({ theme }) => theme.breakpoints.up("md")} {
        display: block;
    }
`;
