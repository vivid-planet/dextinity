import { ClearInputAdornment } from "@dextinity/admin";
import * as imports from "@dextinity/admin-icons";
import { Grid, InputAdornment, InputBase, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { useDebounce } from "use-debounce";

// The wordmark is far too wide for the icon grid; it has its own story.
const iconBlockList = ["DextinityLogo"];

const matchesSearchQuery = (str: string, query: string): boolean => {
    if (!query.length) {
        return true;
    }

    let strIncludesPartOfSearchQuery = false;

    query.split(" ").forEach((part) => {
        if (str.toLowerCase().includes(part.trim())) {
            strIncludesPartOfSearchQuery = true;
        }
    });

    return strIncludesPartOfSearchQuery;
};

const SearchBarRoot = styled("div")`
    margin-bottom: 40px;
`;

const IconContainer = styled("div")`
    padding: 10px;
    display: flex;
    align-items: center;
    border: 1px solid ${({ theme }) => theme.palette.grey[100]};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    background-color: ${({ theme }) => theme.palette.background.paper};
`;

const IconWrapper = styled("div")`
    display: flex;
    align-items: center;
    margin-right: 10px;
`;

const SearchIcon = imports.Search;

const iconsWithSearchTerms = Object.keys(imports)
    .filter((key) => {
        return !key.endsWith("SearchTerms") && key !== "__esModule" && !iconBlockList.includes(key);
    })
    .map((key) => ({
        name: key,
        Icon: imports[key as keyof typeof imports],
        searchTerms: (imports as any)[`${key}SearchTerms`] || "",
    }));

const IconsGrid = ({ searchQuery }: { searchQuery: string }) => (
    <Grid container spacing={4}>
        {iconsWithSearchTerms.map(({ name, searchTerms, Icon }) => {
            if (matchesSearchQuery(searchTerms, searchQuery)) {
                return (
                    <Grid
                        key={name}
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4,
                            lg: 3,
                        }}
                    >
                        <IconContainer>
                            <IconWrapper>
                                <Icon fontSize="large" />
                            </IconWrapper>
                            <Typography>{name}</Typography>
                        </IconContainer>
                    </Grid>
                );
            }
            return null;
        })}
    </Grid>
);

export default {
    title: "Docs/Icons/All Icons",
};

export const AllIcons = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery] = useDebounce(searchQuery.trim().toLowerCase(), 500);

    return (
        <>
            <SearchBarRoot>
                <InputBase
                    fullWidth
                    value={searchQuery}
                    autoFocus
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    startAdornment={
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    }
                    endAdornment={
                        debouncedSearchQuery.length !== 0 && (
                            <InputAdornment position="end">
                                <ClearInputAdornment position="end" onClick={() => setSearchQuery("")} />
                            </InputAdornment>
                        )
                    }
                    placeholder="Search icons by name"
                />
            </SearchBarRoot>
            <IconsGrid searchQuery={debouncedSearchQuery} />
        </>
    );
};
