import { Field, FinalFormInput } from "@dextinity/admin";
import { type BlockInterface, BlocksFinalForm, createBlockSkeleton } from "@dextinity/cms-admin";
import type { NewsDetailBlockData, NewsDetailBlockInput } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

type State = NewsDetailBlockData;

const NewsDetailBlock: BlockInterface<NewsDetailBlockData, State, NewsDetailBlockInput> = {
    ...createBlockSkeleton(),

    name: "NewsDetail",

    displayName: "News Detail",

    defaultValues: () => ({}),

    AdminComponent: ({ state, updateState }) => {
        return (
            <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                <Field
                    name="id"
                    label={<FormattedMessage id="blocks.newsDetail.id.label" defaultMessage="ID" />}
                    fullWidth
                    component={FinalFormInput}
                />
            </BlocksFinalForm>
        );
    },

    previewContent: (state) => (state.id !== undefined ? [{ type: "text", content: state.id }] : []),
};

export { NewsDetailBlock };
