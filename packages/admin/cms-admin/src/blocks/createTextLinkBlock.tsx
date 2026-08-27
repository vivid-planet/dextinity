import { Field, FinalFormInput, messages } from "@dextinity/admin";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

import type { TextLinkBlockData, TextLinkBlockInput } from "../blocks.generated";
import { BlockAdminComponentPaper } from "./common/BlockAdminComponentPaper";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { composeBlocks } from "./helpers/composeBlocks/composeBlocks";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { decomposeUpdateStateAction } from "./helpers/decomposeUpdateStateAction";
import { withAdditionalBlockAttributes } from "./helpers/withAdditionalBlockAttributes";
import { BlockCategory, type BlockInterface, type BlockState } from "./types";

interface CreateTextLinkBlockOptions {
    name?: string;
    displayName?: ReactNode;
    link: BlockInterface;
    tags?: Array<MessageDescriptor | string>;
}

export function createTextLinkBlock(
    { link: LinkBlock, name = "TextLink", displayName = <FormattedMessage {...messages.link} />, tags }: CreateTextLinkBlockOptions,
    override?: (block: BlockInterface) => BlockInterface,
): BlockInterface {
    const { api: composedApi, block: composedBlock } = composeBlocks({ link: LinkBlock });

    const block = withAdditionalBlockAttributes<Pick<TextLinkBlockData, "text">>({
        text: "",
    })(composedBlock);

    const TextLinkBlock: BlockInterface<TextLinkBlockData, BlockState<typeof block>, TextLinkBlockInput> = {
        ...createBlockSkeleton(),
        ...block,

        name,

        displayName,

        tags: tags ? tags : LinkBlock.tags,

        category: BlockCategory.Navigation,

        definesOwnPadding: true,

        AdminComponent: ({ state, updateState }) => {
            const { link } = composedApi.adminComponents({ state, updateState: decomposeUpdateStateAction(updateState, ["link"]) });

            return (
                <BlockAdminComponentPaper disablePadding>
                    <Box padding={3} paddingBottom={0}>
                        <BlocksFinalForm
                            onSubmit={({ text }: { text: string | undefined }) => {
                                updateState((prevState) => ({ ...prevState, text: text ?? "" }));
                            }}
                            initialValues={{ text: state.text }}
                        >
                            <Field label={<FormattedMessage {...messages.text} />} name="text" component={FinalFormInput} fullWidth />
                        </BlocksFinalForm>
                    </Box>
                    {link}
                </BlockAdminComponentPaper>
            );
        },

        previewContent: (state) => [{ type: "text", content: state.text }],

        dynamicDisplayName: (state) => LinkBlock.dynamicDisplayName?.(state.link),

        extractTextContents: (state, options) => {
            const content = [];

            if (state.text) {
                content.push(state.text);
            }

            const blockContent = block.extractTextContents?.(state, options) ?? [];
            content.push(...blockContent);

            return content;
        },
        translateContent: async (state, translate) => {
            const translatedText = state.text ? await translate(state.text) : state.text;
            return { ...state, text: translatedText };
        },
    };

    if (override) {
        return override(TextLinkBlock);
    }

    return TextLinkBlock;
}
