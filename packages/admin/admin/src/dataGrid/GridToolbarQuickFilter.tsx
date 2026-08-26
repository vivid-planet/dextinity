import { Clear, Search } from "@dextinity/admin-icons";
import { InputBase } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { styled } from "@mui/material/styles";
import { QuickFilter, QuickFilterClear, QuickFilterControl } from "@mui/x-data-grid";
import { useIntl } from "react-intl";

import { messages } from "../messages";

type GridToolbarQuickFilterProps = {
    placeholder?: string;
};

/**
 * Custom quick filter component to support a persistent quick filter.
 * Adapted from https://mui.com/x/react-data-grid/components/quick-filter/#persistent-quick-filter.
 */
export function GridToolbarQuickFilter({ placeholder }: GridToolbarQuickFilterProps) {
    const intl = useIntl();

    return (
        <Root expanded>
            <QuickFilterControl
                render={({ ref, ...other }) => (
                    <InputBase
                        {...other}
                        inputRef={ref}
                        placeholder={
                            placeholder ?? intl.formatMessage({ id: "dextinity.dataGrid.quickFilter.placeholder", defaultMessage: "Search..." })
                        }
                        size="small"
                        slotProps={{
                            input: {
                                sx: {
                                    paddingRight: 0, // Removes unnecessary spacing to the clear button that already has enough spacing
                                    textOverflow: "ellipsis",
                                },
                            },
                        }}
                        startAdornment={
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        }
                        endAdornment={
                            <InputAdornment position="end">
                                {other.value ? (
                                    <ClearButton edge="end" aria-label={intl.formatMessage(messages.clear)}>
                                        <Clear fontSize="inherit" />
                                    </ClearButton>
                                ) : null}
                            </InputAdornment>
                        }
                    />
                )}
            />
        </Root>
    );
}

const Root = styled(QuickFilter)(({ theme }) => ({
    width: 120,

    [theme.breakpoints.up("sm")]: {
        width: 150,
    },

    [theme.breakpoints.up("md")]: {
        width: "auto",
    },
}));

const ClearButton = styled(QuickFilterClear)(({ theme }) => ({
    alignSelf: "stretch",
    color: theme.palette.grey[200],
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 12,
    marginRight: theme.spacing(-2),
    borderRadius: 0,
}));
