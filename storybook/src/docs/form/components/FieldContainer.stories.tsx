import { FieldContainer } from "@dextinity/admin";
import { Info } from "@dextinity/admin-icons";
import { InputBase } from "@mui/material";
import { type ChangeEvent, useState } from "react";

export default {
    title: "Docs/Form/Components/FieldContainer",
};

export const Basic = {
    render: () => {
        const [value, setValue] = useState<string>("");

        function handleChange(e: ChangeEvent<HTMLInputElement>) {
            setValue(e.target.value);
        }

        return (
            <form>
                <FieldContainer label="Normal">
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
                </FieldContainer>
                <FieldContainer label="Required" required>
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
                </FieldContainer>
                <FieldContainer label="Disabled" disabled>
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" disabled />
                </FieldContainer>
                <br />
                <FieldContainer label="Error" error="This is an error">
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
                </FieldContainer>
                <FieldContainer label="Warning" warning="This is a warning">
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
                </FieldContainer>
                <FieldContainer label="Helper" helperText="This is a helper">
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
                </FieldContainer>
                <br />
                <FieldContainer label="Secondary Helper Text" secondaryHelperText={`${value.length}/100`}>
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
                </FieldContainer>
                <FieldContainer label="Multiple Helper Texts" helperText="Helper Text" secondaryHelperText={`${value.length}/100`}>
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
                </FieldContainer>
                <FieldContainer label="Helper Text Icon" helperTextIcon={<Info />} helperText="Helper Text with icon">
                    <InputBase onChange={handleChange} value={value} placeholder="Placeholder" />
                </FieldContainer>
            </form>
        );
    },

    name: "FieldContainer",
};
