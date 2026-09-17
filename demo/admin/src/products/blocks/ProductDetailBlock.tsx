import { Field, FinalFormInput } from "@dextinity/admin";
import { type BlockInterface, BlocksFinalForm, createBlockSkeleton } from "@dextinity/cms-admin";
import type { ProductDetailBlockData, ProductDetailBlockInput } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

type State = ProductDetailBlockData;

const ProductDetailBlock: BlockInterface<ProductDetailBlockData, State, ProductDetailBlockInput> = {
    ...createBlockSkeleton(),

    name: "ProductDetail",

    displayName: "Product Detail",

    defaultValues: () => ({}),

    AdminComponent: ({ state, updateState }) => {
        return (
            <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                <Field
                    name="id"
                    label={<FormattedMessage id="blocks.productDetail.id.label" defaultMessage="ID" />}
                    fullWidth
                    component={FinalFormInput}
                />
            </BlocksFinalForm>
        );
    },

    previewContent: (state) => (state.id !== undefined ? [{ type: "text", content: state.id }] : []),
};

export { ProductDetailBlock };
