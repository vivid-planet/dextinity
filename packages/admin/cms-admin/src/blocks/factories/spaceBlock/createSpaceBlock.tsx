import { SelectField } from "@dextinity/ui-react-final-form";
import type { ReactNode } from "react";
import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";

import { BlocksFinalForm } from "../../form/BlocksFinalForm";
import { messageText } from "../../form/messageText";
import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "../../iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface } from "../../types";

interface SpaceBlockFactoryOptions<T> {
    name?: string;
    defaultValue: T;
    options: { value: T; label: ReactNode }[];
    /**
     * The label of the spacing select.
     *
     * @defaultValue "Spacing"
     */
    label?: ReactNode;
    tags?: Array<MessageDescriptor | string>;
}

interface SpacingSelectProps<T> {
    label: ReactNode;
    options: { value: T; label: ReactNode }[];
}

function SpacingSelect<T extends string | number>({ label, options }: SpacingSelectProps<T>) {
    const intl = useIntl();
    const selectOptions = options.map((option) => ({ ...option, textValue: messageText(intl, option.label) }));
    return <SelectField<false, T> name="spacing" label={label} options={selectOptions} required />;
}

export const createSpaceBlock = <T extends string | number>({
    name = "Space",
    defaultValue,
    options,
    label = <FormattedMessage id="dextinity.blocks.space.spacing" defaultMessage="Spacing" />,
    tags,
}: SpaceBlockFactoryOptions<T>): BlockInterface => {
    const SpaceBlock: BlockInterface<{ spacing: T }, { spacing: T }, { spacing: T }> = {
        ...createBlockSkeleton(),

        name,

        displayName: <FormattedMessage id="dextinity.blocks.space" defaultMessage="Space" />,

        category: BlockCategory.Layout,
        iconName: "density-comfortable",
        description: <FormattedMessage id="dextinity.blocks.space.description" defaultMessage="Empty space between blocks" />,

        tags,

        defaultValues: () => ({ spacing: defaultValue }),

        AdminComponent: ({ state, updateState }) => {
            return (
                <SelectPreviewComponent>
                    <BlocksFinalForm<{ spacing: T }> onSubmit={updateState} initialValues={state}>
                        <SpacingSelect<T> label={label} options={options} />
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
