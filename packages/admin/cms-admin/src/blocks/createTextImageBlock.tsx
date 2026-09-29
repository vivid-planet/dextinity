import { messages } from "@dextinity/admin";
import { FormControlLabel, MenuItem, Radio, RadioGroup, Select } from "@mui/material";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

import type { TextImageBlockData, TextImageBlockInput } from "../blocks.generated";
import { useDamConfig } from "../dam/config/damConfig";
import { BlockAdminComponentPaper } from "./common/BlockAdminComponentPaper";
import { BlockAdminComponentSection } from "./common/BlockAdminComponentSection";
import type { RichTextBlock, RichTextBlockState } from "./createRichTextBlock";
import { composeBlocks } from "./helpers/composeBlocks/composeBlocks";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { decomposeUpdateStateAction } from "./helpers/decomposeUpdateStateAction";
import { withAdditionalBlockAttributes } from "./helpers/withAdditionalBlockAttributes";
import { type ImageBlockState, PixelImageBlock } from "./PixelImageBlock";
import { BlockCategory, type BlockInterface } from "./types";

interface State {
    text: RichTextBlockState;
    image: ImageBlockState;
    imagePosition: "left" | "right";
    imageAspectRatio: string;
}

export interface TextImageBlockFactoryOptions {
    text: RichTextBlock;
    image?: BlockInterface;
    tags?: Array<MessageDescriptor | string>;
}

const createTextImageBlock = (
    { text, image = PixelImageBlock, tags }: TextImageBlockFactoryOptions,
    override?: (
        block: BlockInterface<TextImageBlockData, State, TextImageBlockInput>,
    ) => BlockInterface<TextImageBlockData, State, TextImageBlockInput>,
): BlockInterface<TextImageBlockData, State, TextImageBlockInput> => {
    const composed = composeBlocks({ text, image });

    const { api: composedApi, block: composedBlock } = composed;

    const block = withAdditionalBlockAttributes<Pick<TextImageBlockData, "imagePosition" | "imageAspectRatio">>({
        imagePosition: "left",
        imageAspectRatio: "4x3",
    })(composedBlock);

    const TextImageBlock: BlockInterface<TextImageBlockData, State, TextImageBlockInput> = {
        ...createBlockSkeleton(),
        ...block,

        name: "TextImage",

        displayName: <FormattedMessage id="dextinity.blocks.textImage" defaultMessage="Text/Image" />,

        category: BlockCategory.TextAndContent,

        tags: tags ? tags : [...(text.tags || []), ...(image.tags || [])],

        AdminComponent: ({ state, updateState }) => {
            const { text, image } = composedApi.adminComponents({
                state,
                updateState: decomposeUpdateStateAction(updateState, ["text", "image"]),
            });
            const { allowedImageAspectRatios } = useDamConfig();

            return (
                <>
                    <BlockAdminComponentSection title={<FormattedMessage id="dextinity.blocks.textImage.text" defaultMessage="Text" />}>
                        {text}
                    </BlockAdminComponentSection>
                    <BlockAdminComponentSection title={<FormattedMessage id="dextinity.blocks.textImage.image" defaultMessage="Image" />}>
                        <BlockAdminComponentPaper disablePadding>{image}</BlockAdminComponentPaper>
                    </BlockAdminComponentSection>
                    <BlockAdminComponentSection
                        title={<FormattedMessage id="dextinity.blocks.textImage.imagePosition" defaultMessage="Image position" />}
                    >
                        <RadioGroup
                            row
                            value={state.imagePosition}
                            onChange={(event) => {
                                updateState((prevState) => ({
                                    ...prevState,
                                    imagePosition: event.target.value as TextImageBlockData["imagePosition"],
                                }));
                            }}
                        >
                            <FormControlLabel value="left" control={<Radio />} label={<FormattedMessage {...messages.left} />} />
                            <FormControlLabel value="right" control={<Radio />} label={<FormattedMessage {...messages.right} />} />
                        </RadioGroup>
                    </BlockAdminComponentSection>
                    <BlockAdminComponentSection
                        title={<FormattedMessage id="dextinity.blocks.textImage.imageAspectRatio" defaultMessage="Image aspect ratio" />}
                    >
                        <Select
                            value={state.imageAspectRatio}
                            onChange={(event) => {
                                updateState((prevState) => ({
                                    ...prevState,
                                    imageAspectRatio: event.target.value as string,
                                }));
                            }}
                            fullWidth
                        >
                            {allowedImageAspectRatios.map((aspectRatio) => (
                                <MenuItem key={aspectRatio} value={aspectRatio}>
                                    {aspectRatio}
                                </MenuItem>
                            ))}
                        </Select>
                    </BlockAdminComponentSection>
                </>
            );
        },
    };

    if (override) {
        return override(TextImageBlock);
    }

    return TextImageBlock;
};

export { createTextImageBlock };
