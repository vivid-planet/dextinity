import { Field } from "@dextinity/admin";
import { defineMessage, FormattedMessage } from "react-intl";

import type { PixelImageBlockData, SvgImageBlockData } from "../../blocks.generated";
import { createOneOfBlock } from "../../blocks/factories/createOneOfBlock";
import { BlocksFinalForm } from "../../blocks/form/BlocksFinalForm";
import { createPixelImageBlock, type PixelImageBlockFactoryOptions } from "../../blocks/PixelImageBlock";
import { SvgImageBlock } from "../../blocks/SvgImageBlock";
import { BlockCategory, type BlockInterface } from "../../blocks/types";
import { resolveNewState } from "../../blocks/utils";
import { FixedAspectRatioHint } from "../../common/image/FixedAspectRatioHint";
import { FileField, type GQLDamFileFieldFileFragment } from "../../form/file/FileField";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";

export type DamImageBlockFactoryOptions = {
    /**
     * Locks the crop area in the edit image dialog to a fixed aspect ratio, e.g. `"16x9"`, `"16/9"`, `"16:9"` or `16 / 9`.
     *
     * Set it to the ratio the site renders the image at, so the editor crops the shape they will actually see. Has no
     * effect on a selected SVG image, which isn't cropped.
     */
    aspectRatio?: PixelImageBlockFactoryOptions["aspectRatio"];
};

export function createDamImageBlock({ aspectRatio }: DamImageBlockFactoryOptions = {}) {
    const supportedBlocks: Record<string, BlockInterface> = {
        pixelImage: createPixelImageBlock({ aspectRatio }),
        svgImage: SvgImageBlock,
    };

    const DamImageBlock = createOneOfBlock({
        name: "DamImage",
        displayName: <FormattedMessage id="dextinity.blocks.damImage" defaultMessage="Image" />,
        category: BlockCategory.Media,
        supportedBlocks,
        allowEmpty: false,
        tags: [defineMessage({ id: "dextinity.damImageBlock.tag.image", defaultMessage: "Image" })],
    });

    // Custom Admin component to improve the image selection UX.
    // Allows selecting both pixel and SVG images and "chooses" the correct supported block.
    DamImageBlock.AdminComponent = function AdminComponent({ state, updateState }) {
        const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();

        if (!state.activeType) {
            throw new Error("No active type");
        }

        const activeBlock = state.attachedBlocks.find((block) => block.type === state.activeType);

        if (activeBlock === undefined) {
            throw new Error(`No block found for type ${state.activeType}`);
        }

        const isEmpty = (activeBlock.props as PixelImageBlockData | SvgImageBlockData).damFile === undefined;

        if (isEmpty) {
            return (
                <BlocksFinalForm<{ damFile?: GQLDamFileFieldFileFragment }>
                    onSubmit={({ damFile }) => {
                        if (damFile === undefined) {
                            return;
                        }

                        const type = filteredAcceptedMimeTypes.pixelImage.includes(damFile.mimetype) ? "pixelImage" : "svgImage";

                        updateState({
                            attachedBlocks: [
                                {
                                    type,
                                    props: {
                                        damFile,
                                    },
                                },
                            ],
                            activeType: type,
                        });
                    }}
                    initialValues={{}}
                >
                    <Field
                        name="damFile"
                        component={FileField}
                        fullWidth
                        helperText={aspectRatio !== undefined && <FixedAspectRatioHint aspectRatio={aspectRatio} />}
                        buttonText={<FormattedMessage id="dextinity.blocks.image.chooseImage" defaultMessage="Choose image" />}
                        allowedMimetypes={[...filteredAcceptedMimeTypes.pixelImage, ...filteredAcceptedMimeTypes.svgImage]}
                    />
                </BlocksFinalForm>
            );
        } else {
            const AdminComponent = supportedBlocks[state.activeType].AdminComponent;

            return (
                <AdminComponent
                    state={activeBlock.props}
                    updateState={(setStateAction) => {
                        updateState({
                            attachedBlocks: [
                                {
                                    type: activeBlock.type,
                                    props: resolveNewState({ prevState: activeBlock.props, setStateAction }),
                                },
                            ],
                            activeType: activeBlock.type,
                        });
                    }}
                />
            );
        }
    };

    // Disable dynamic display name. Would display "SVG" for a selected SVG image, but we want to always display "Image".
    DamImageBlock.dynamicDisplayName = undefined;

    return DamImageBlock;
}

export const DamImageBlock = createDamImageBlock();
