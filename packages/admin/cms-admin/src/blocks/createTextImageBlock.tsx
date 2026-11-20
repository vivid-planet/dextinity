import { messages } from "@dextinity/admin";
import { FormControlLabel, MenuItem, Radio, RadioGroup, Select } from "@mui/material";
import { FormattedMessage, type MessageDescriptor } from "react-intl";

import type { TextImageBlockData as GeneratedTextImageBlockData, TextImageBlockInput as GeneratedTextImageBlockInput } from "../blocks.generated";
import { useDamConfig } from "../dam/config/damConfig";
import { BlockAdminComponentPaper } from "./common/BlockAdminComponentPaper";
import { BlockAdminComponentSection } from "./common/BlockAdminComponentSection";
import type { RichTextBlock } from "./createRichTextBlock";
import { composeBlocks } from "./helpers/composeBlocks/composeBlocks";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { decomposeUpdateStateAction } from "./helpers/decomposeUpdateStateAction";
import { withAdditionalBlockAttributes } from "./helpers/withAdditionalBlockAttributes";
import { type ImageBlockState, PixelImageBlock } from "./PixelImageBlock";
import { BlockCategory, type BlockInputApi, type BlockInterface, type BlockOutputApi, type BlockState } from "./types";

type TextImageBlockData<TextBlock extends BlockInterface> = Omit<GeneratedTextImageBlockData, "text"> & { text: BlockInputApi<TextBlock> };

type TextImageBlockInput<TextBlock extends BlockInterface> = Omit<GeneratedTextImageBlockInput, "text"> & { text: BlockOutputApi<TextBlock> };

interface TextImageBlockState<TextBlock extends BlockInterface> {
    text: BlockState<TextBlock>;
    image: ImageBlockState;
    imagePosition: "left" | "right";
    imageAspectRatio: string;
}

type TextImageBlockInterface<TextBlock extends BlockInterface> = BlockInterface<
    TextImageBlockData<TextBlock>,
    TextImageBlockState<TextBlock>,
    TextImageBlockInput<TextBlock>
>;

export interface TextImageBlockFactoryOptions<TextBlock extends BlockInterface = RichTextBlock> {
    text: TextBlock;
    image?: BlockInterface;
    tags?: Array<MessageDescriptor | string>;
}

const createTextImageBlock = <TextBlock extends BlockInterface = RichTextBlock>(
    { text, image = PixelImageBlock, tags }: TextImageBlockFactoryOptions<TextBlock>,
    override?: (block: TextImageBlockInterface<TextBlock>) => TextImageBlockInterface<TextBlock>,
): TextImageBlockInterface<TextBlock> => {
    // composeBlocks' mapped types can't be resolved for a generic text block
    const composed = composeBlocks({ text: text as BlockInterface, image });

    const { api: composedApi, block: composedBlock } = composed;

    const block = withAdditionalBlockAttributes<Pick<GeneratedTextImageBlockData, "imagePosition" | "imageAspectRatio">>({
        imagePosition: "left",
        imageAspectRatio: "4x3",
    })(composedBlock);

    const TextImageBlock: TextImageBlockInterface<TextBlock> = {
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
                                    imagePosition: event.target.value as GeneratedTextImageBlockData["imagePosition"],
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
