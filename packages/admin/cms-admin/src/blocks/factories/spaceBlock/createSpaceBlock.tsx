import { SelectField } from "@dextinity/admin";
import { MenuItem } from "@mui/material";
import type { ReactNode } from "react";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

import { BlocksFinalForm } from "../../form/BlocksFinalForm";
import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "../../iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface } from "../../types";

interface SpaceBlockFactoryOptions<T> {
    name?: string;
    defaultValue: T;
    options: { value: T; label: ReactNode }[];
    tags?: Array<MessageDescriptor | string>;
}

export const createSpaceBlock = <T extends string | number>({
    name = "Space",
    defaultValue,
    options,
    tags,
}: SpaceBlockFactoryOptions<T>): BlockInterface => {
    const SpaceBlock: BlockInterface<{ spacing: T }, { spacing: T }, { spacing: T }> = {
        ...createBlockSkeleton(),

        name,

        displayName: <FormattedMessage id="dextinity.blocks.space" defaultMessage="Space" />,

        category: BlockCategory.Layout,

        tags,

        defaultValues: () => ({ spacing: defaultValue }),

        AdminComponent: ({ state, updateState }) => {
            return (
                <SelectPreviewComponent>
                    <BlocksFinalForm<{ spacing: T }> onSubmit={updateState} initialValues={state}>
                        <SelectField name="spacing" fullWidth required>
                            {options.map(({ value, label }) => (
                                <MenuItem key={value} value={value}>
                                    {label}
                                </MenuItem>
                            ))}
                        </SelectField>
                    </BlocksFinalForm>
                </SelectPreviewComponent>
            );
        },

        previewContent: ({ spacing }) => {
            return [{ type: "text", content: options.find((option) => option.value === spacing)?.label }];
        },

        extractTextContents: () => [],
    };

    return SpaceBlock;
};
