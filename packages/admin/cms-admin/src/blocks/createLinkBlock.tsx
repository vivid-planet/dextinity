import { Field, FinalFormInput } from "@dextinity/admin";
import { Box } from "@mui/system";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

import type { LinkBlockData } from "../blocks.generated";
import { useBlockAdminComponentPaper } from "./common/BlockAdminComponentPaper";
import { BlockAdminComponentSection } from "./common/BlockAdminComponentSection";
import { ExternalLinkBlock } from "./ExternalLinkBlock";
import { createOneOfBlock, type CreateOneOfBlockOptions } from "./factories/createOneOfBlock";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { InternalLinkBlock } from "./InternalLinkBlock";
import type { BlockInterface, LinkBlockInterface } from "./types";

interface CreateLinkBlockOptions extends Omit<CreateOneOfBlockOptions<boolean>, "name" | "supportedBlocks"> {
    name?: string;
    supportedBlocks?: Record<string, BlockInterface & LinkBlockInterface>;
    tags?: Array<MessageDescriptor | string>;
}

function createLinkBlock(
    {
        name = "Link",
        displayName = <FormattedMessage id="dextinity.blocks.link" defaultMessage="Link" />,
        supportedBlocks = { internal: InternalLinkBlock, external: ExternalLinkBlock },
        allowEmpty = false,
        tags,
        ...oneOfBlockOptions
    }: CreateLinkBlockOptions,
    override?: (block: BlockInterface & LinkBlockInterface) => BlockInterface & LinkBlockInterface,
): BlockInterface & LinkBlockInterface {
    const OneOfBlock = createOneOfBlock(
        {
            name,
            displayName,
            supportedBlocks,
            allowEmpty,
            tags,
            ...oneOfBlockOptions,
        },
        override,
    );

    const childTags = Object.values(supportedBlocks).reduce<Array<MessageDescriptor | string>>((acc, block) => {
        if (block.tags) {
            return [...acc, ...block.tags];
        }
        return acc;
    }, []);

    return {
        ...OneOfBlock,
        defaultValues: () => ({ ...OneOfBlock.defaultValues(), title: undefined }),
        AdminComponent: ({ state, updateState }) => {
            const isInPaper = useBlockAdminComponentPaper();

            return (
                <>
                    <OneOfBlock.AdminComponent state={state} updateState={updateState} />
                    <Box padding={isInPaper ? 3 : 0} paddingTop={isInPaper ? 0 : 3}>
                        <BlockAdminComponentSection>
                            <BlocksFinalForm<Pick<LinkBlockData, "title">>
                                onSubmit={({ title }) => {
                                    updateState({ ...state, title });
                                }}
                                initialValues={{ title: state.title }}
                            >
                                <Field
                                    name="title"
                                    component={FinalFormInput}
                                    label={<FormattedMessage id="dextinity.blocks.link.title" defaultMessage="Title" />}
                                    fullWidth
                                />
                            </BlocksFinalForm>
                        </BlockAdminComponentSection>
                    </Box>
                </>
            );
        },
        url2State: (url) => {
            for (const [type, block] of Object.entries(supportedBlocks)) {
                if (block.url2State?.(url)) {
                    return {
                        attachedBlocks: [{ type, props: block.url2State(url) }],
                        activeType: type,
                    };
                }
            }

            return false;
        },
        tags: tags ? tags : childTags,
        translateContent: async (state, translate) => {
            const translatedState = OneOfBlock.translateContent ? await OneOfBlock.translateContent(state, translate) : state;
            const translatedTitle = state.title ? await translate(state.title) : state.title;
            return { ...translatedState, title: translatedTitle };
        },
    };
}

export { createLinkBlock };
