import { type BlockInterface, BlocksFinalForm, createBlockSkeleton } from "@dextinity/cms-admin";
import { InputField } from "@dextinity/ui-react-final-form";
import type { NewsDetailBlockData, NewsDetailBlockInput } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

type State = NewsDetailBlockData;

const NewsDetailBlock: BlockInterface<NewsDetailBlockData, State, NewsDetailBlockInput> = {
    ...createBlockSkeleton(),

    name: "NewsDetail",

    displayName: "News Detail",
    iconName: "news",
    description: <FormattedMessage id="blocks.newsDetail.description" defaultMessage="One news article" />,

    defaultValues: () => ({}),

    AdminComponent: ({ state, updateState }) => {
        return (
            <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                <InputField name="id" label={<FormattedMessage id="blocks.newsDetail.id.label" defaultMessage="ID" />} />
            </BlocksFinalForm>
        );
    },

    previewContent: (state) => (state.id !== undefined ? [{ type: "text", content: state.id }] : []),
};

export { NewsDetailBlock };
