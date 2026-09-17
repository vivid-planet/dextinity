import { TextField } from "@dextinity/admin";
import { FileData } from "@dextinity/admin-icons";
import { type BlockInterface, BlocksFinalForm, createBlockSkeleton, type LinkBlockInterface } from "@dextinity/cms-admin";
import type { ProductLinkBlockData, ProductLinkBlockInput } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

type State = ProductLinkBlockData;

const ProductLinkBlock: BlockInterface<ProductLinkBlockData, State, ProductLinkBlockInput> & LinkBlockInterface<State> = {
    ...createBlockSkeleton(),

    name: "ProductLink",

    displayName: "Product",

    defaultValues: () => ({}),

    AdminComponent: ({ state, updateState }) => {
        return (
            <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                <TextField
                    name="id"
                    label={<FormattedMessage id="blocks.productLink.id.label" defaultMessage="ID" />}
                    fullWidth
                    disableContentTranslation
                />
            </BlocksFinalForm>
        );
    },

    previewContent: (state) => [...(state.id !== undefined ? [{ type: "text" as const, content: state.id }] : [])],
    icon: (state) => <FileData color="primary" />,
};

export { ProductLinkBlock };
