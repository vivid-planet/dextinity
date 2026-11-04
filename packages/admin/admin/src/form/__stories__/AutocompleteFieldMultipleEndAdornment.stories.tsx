import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";

import { FinalForm } from "../../FinalForm";
import { AutocompleteField } from "../../form/fields/AutocompleteField";

/**
 * Layout regression test for the end adornment of a multi-select AutocompleteField.
 *
 * The clear button and popup icon must stay in the top right corner of the field and must never wrap below the
 * chips or overlap them – regardless of how many chips are selected and which adornments (loading, clear, error,
 * popup icon) are rendered. Clicking anywhere into the field must still open the dropdown.
 * Use the container-width control to test different widths.
 */
const config: Meta = {
    title: "components/form/AutocompleteField/MultipleEndAdornment",
    argTypes: {
        containerWidth: {
            control: { type: "range", min: 200, max: 1000, step: 5 },
            description: "Container width in px",
        },
    },
    args: {
        containerWidth: 505,
    },
};
export default config;

interface Option {
    label: string;
    value: string;
}

const longChip: Option = { label: "Supercalifragilisticexpialidocious Chocolate Ice Cream", value: "long" };
const smallChips: Option[] = [
    { label: "Chocolate", value: "chocolate" },
    { label: "Strawberry", value: "strawberry" },
    { label: "Vanilla", value: "vanilla" },
];
const manyChips: Option[] = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
    { label: "Date", value: "date" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Fig", value: "fig" },
    { label: "Grape", value: "grape" },
    { label: "Honeydew", value: "honeydew" },
];
const allOptions: Option[] = [longChip, ...smallChips, ...manyChips];

const Case = ({ label, children }: PropsWithChildren<{ label: string }>) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {label}
            </Typography>
            {children}
        </Box>
    );
};

interface MultiFieldProps {
    initialValues: Option[];
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    loadingError?: Error | null;
}

const MultiField = ({ initialValues, required, disabled, loading, loadingError }: MultiFieldProps) => {
    return (
        <FinalForm
            mode="edit"
            initialValues={{ field: initialValues }}
            onSubmit={() => {
                // not handled
            }}
        >
            {() => (
                <AutocompleteField<Option, true, false, false>
                    name="field"
                    multiple
                    options={allOptions}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    fullWidth
                    required={required}
                    disabled={disabled}
                    loading={loading}
                    loadingError={loadingError ?? null}
                />
            )}
        </FinalForm>
    );
};

const SingleField = ({ initialValue }: { initialValue: Option | null }) => {
    return (
        <FinalForm
            mode="edit"
            initialValues={{ field: initialValue }}
            onSubmit={() => {
                // not handled
            }}
        >
            {() => (
                <AutocompleteField<Option, false, false, false>
                    name="field"
                    options={allOptions}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    fullWidth
                />
            )}
        </FinalForm>
    );
};

export const AllCases: StoryObj<{ containerWidth: number }> = {
    render: ({ containerWidth }) => (
        <Box sx={{ width: containerWidth, p: 2, border: "1px dashed #ccc" }}>
            <Typography variant="caption" sx={{ display: "block", mb: 2 }}>
                Container width: {containerWidth}px
            </Typography>

            <Case label="Case 1: One long chip">
                <MultiField initialValues={[longChip]} />
            </Case>

            <Case label="Case 2: Multiple small chips filling the row">
                <MultiField initialValues={smallChips} />
            </Case>

            <Case label="Case 3: Many chips wrapping to several rows">
                <MultiField initialValues={manyChips} />
            </Case>

            <Case label="Case 4: Mixed long + short chip">
                <MultiField initialValues={[longChip, { label: "Vanilla", value: "vanilla" }]} />
            </Case>

            <Case label="Case 5: Required (no clear button) with long chip">
                <MultiField initialValues={[longChip]} required />
            </Case>

            <Case label="Case 6: Empty (no chips)">
                <MultiField initialValues={[]} />
            </Case>

            <Case label="Case 7: Disabled with many chips">
                <MultiField initialValues={manyChips} disabled />
            </Case>

            <Case label="Case 8: All end-adornment slots populated (loading + error + clear + popup)">
                <MultiField initialValues={smallChips} loading loadingError={new Error("Failed to load")} />
            </Case>

            <Case label="Case 9: Single-select with long value">
                <SingleField initialValue={longChip} />
            </Case>
        </Box>
    ),
};
