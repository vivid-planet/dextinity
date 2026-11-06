import { BlockInputField, type BlockInterface, BlocksFinalForm, createBlockSkeleton, type LinkBlockInterface } from "@dextinity/cms-admin";
import { Icon } from "@dextinity/ui";
import type { NewsLinkBlockData, NewsLinkBlockInput } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

type State = NewsLinkBlockData;

const NewsLinkBlock: BlockInterface<NewsLinkBlockData, State, NewsLinkBlockInput> & LinkBlockInterface<State> = {
    ...createBlockSkeleton(),

    name: "NewsLink",

    displayName: "News",

    defaultValues: () => ({}),

    AdminComponent: ({ state, updateState }) => {
        return (
            <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                <BlockInputField name="id" label={<FormattedMessage id="blocks.newsLink.id.label" defaultMessage="ID" />} disableContentTranslation />
            </BlocksFinalForm>
        );
    },

    previewContent: (state) => [...(state.id !== undefined ? [{ type: "text" as const, content: state.id }] : [])],
    icon: () => <Icon name="file-data" />,
};

export { NewsLinkBlock };
