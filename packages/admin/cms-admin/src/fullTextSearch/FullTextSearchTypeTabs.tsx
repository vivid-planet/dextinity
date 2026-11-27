import { Chip, Stack, Tab, Tabs, tabsClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";

import { FullTextSearchTypeIcon } from "./FullTextSearchTypeIcon";
import { useFullTextSearchTypeLabel } from "./useFullTextSearchTypeLabel";
import type { FullTextSearchType } from "./useFullTextSearchTypes";

export interface FullTextSearchTypeTab extends FullTextSearchType {
    count?: number;
}

interface FullTextSearchTypeTabsProps {
    tabs: FullTextSearchTypeTab[];
    totalCount?: number;
    activeType: string | undefined;
    onChange: (activeType: string | undefined) => void;
}

const allTypesValue = "";

export function FullTextSearchTypeTabs({ tabs, totalCount, activeType, onChange }: FullTextSearchTypeTabsProps) {
    const getTypeLabel = useFullTextSearchTypeLabel();

    return (
        <TypeTabs
            value={activeType ?? allTypesValue}
            onChange={(_, value: string) => onChange(value === allTypesValue ? undefined : value)}
            variant="scrollable"
            scrollButtons="auto"
        >
            <Tab
                value={allTypesValue}
                label={<TabLabel label={<FormattedMessage id="dextinity.fullTextSearch.allTypes" defaultMessage="All" />} count={totalCount} />}
            />
            {tabs.map((tab) => (
                <Tab
                    key={tab.type}
                    value={tab.type}
                    icon={<FullTextSearchTypeIcon searchType={tab} />}
                    iconPosition="start"
                    label={<TabLabel label={getTypeLabel(tab)} count={tab.count} />}
                />
            ))}
        </TypeTabs>
    );
}

function TabLabel({ label, count }: { label: ReactNode; count?: number }) {
    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <span>{label}</span>
            {count !== undefined && <Chip size="small" variant={count === 0 ? "outlined" : "filled"} label={<FormattedNumber value={count} />} />}
        </Stack>
    );
}

const TypeTabs = styled(Tabs)`
    flex-shrink: 0;
    margin-bottom: 0;
    padding: ${({ theme }) => theme.spacing(0, 2)};

    .${tabsClasses.scrollButtons}.Mui-disabled {
        width: 0;
    }
`;
