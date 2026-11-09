import { FormattedMessage, useIntl } from "react-intl";

import type { AnchorBlockData, AnchorBlockInput } from "../blocks.generated";
import { BlockInputField } from "./form/BlockInputField";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface } from "./types";

const AnchorBlock: BlockInterface<AnchorBlockData, AnchorBlockData, AnchorBlockInput> = {
    ...createBlockSkeleton(),

    defaultValues: () => ({ name: undefined }),

    name: "Anchor",

    displayName: <FormattedMessage id="dextinity.blocks.anchor.displayName" defaultMessage="Anchor" />,

    category: BlockCategory.Navigation,
    iconName: "locate",
    description: <FormattedMessage id="dextinity.blocks.anchor.description" defaultMessage="Jump target that links can point to" />,

    AdminComponent: ({ state: { name }, updateState }) => {
        const intl = useIntl();

        return (
            <SelectPreviewComponent>
                <BlocksFinalForm<AnchorBlockData> onSubmit={updateState} initialValues={{ name }}>
                    <BlockInputField
                        name="name"
                        label={<FormattedMessage id="dextinity.blocks.anchor.label" defaultMessage="Anchor" />}
                        placeholder={intl.formatMessage({ id: "dextinity.blocks.anchor.placeholder", defaultMessage: "Name" })}
                    />
                </BlocksFinalForm>
            </SelectPreviewComponent>
        );
    },

    anchors: (state) => {
        return state.name !== undefined ? [state.name] : [];
    },

    previewContent: (state) => {
        return state.name !== undefined ? [{ type: "text", content: `#${state.name}` }] : [];
    },

    extractTextContents: (state) => {
        return state.name !== undefined ? [state.name] : [];
    },
};

export { AnchorBlock };
