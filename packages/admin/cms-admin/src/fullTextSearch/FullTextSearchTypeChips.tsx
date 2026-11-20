import { Chip, Stack } from "@mui/material";
import { Fragment, type ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { useFullTextSearchTypeLabel } from "./useFullTextSearchTypeLabel";

interface FullTextSearchTypeCount {
    type: string;
    entityName: string;
    count: number;
}

interface FullTextSearchTypeChipsProps {
    typeCounts: FullTextSearchTypeCount[];
    selectedTypes: string[];
    onChange: (selectedTypes: string[]) => void;
}

export function FullTextSearchTypeChips({ typeCounts, selectedTypes, onChange }: FullTextSearchTypeChipsProps) {
    const getTypeLabel = useFullTextSearchTypeLabel();

    const totalCount = typeCounts.reduce((sum, typeCount) => sum + typeCount.count, 0);
    // A selected type without results must stay visible, otherwise it couldn't be deselected
    const selectedTypesWithoutResults = selectedTypes
        .filter((selectedType) => !typeCounts.some((typeCount) => typeCount.type === selectedType))
        .map((type) => ({ type, entityName: type, count: 0 }));

    const toggleType = (type: string) => {
        onChange(selectedTypes.includes(type) ? selectedTypes.filter((selectedType) => selectedType !== type) : [...selectedTypes, type]);
    };

    return (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <TypeChip
                selected={selectedTypes.length === 0}
                label={<FormattedMessage id="dextinity.fullTextSearch.allTypes" defaultMessage="All" />}
                count={totalCount}
                onClick={() => onChange([])}
            />
            {[...typeCounts, ...selectedTypesWithoutResults].map((typeCount) => (
                <TypeChip
                    key={typeCount.type}
                    selected={selectedTypes.includes(typeCount.type)}
                    label={getTypeLabel(typeCount)}
                    count={typeCount.count}
                    onClick={() => toggleType(typeCount.type)}
                />
            ))}
        </Stack>
    );
}

interface TypeChipProps {
    selected: boolean;
    label: ReactNode;
    count: number;
    onClick: () => void;
}

function TypeChip({ selected, label, count, onClick }: TypeChipProps) {
    return (
        <Chip
            size="small"
            clickable
            variant={selected ? "filled" : "outlined"}
            color={selected ? "primary" : "default"}
            aria-pressed={selected}
            label={
                <FormattedMessage
                    id="dextinity.fullTextSearch.typeCount"
                    defaultMessage="{type} ({count, number})"
                    values={{ type: <Fragment key="type">{label}</Fragment>, count }}
                />
            }
            onClick={onClick}
        />
    );
}
