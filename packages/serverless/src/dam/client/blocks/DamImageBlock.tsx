import { Field } from "@dextinity/admin";
import { BlockCategory, type BlockInterface, BlocksFinalForm, createOneOfBlock, resolveNewState } from "@dextinity/cms-admin";
import { defineMessage, FormattedMessage } from "react-intl";

import type { DamBlockFile } from "./damBlockFile.js";
import { DamFileField } from "./DamFileField.js";
import { pixelImageMimetypes, svgImageMimetypes } from "./damMimetypes.js";
import { PixelImageBlock } from "./PixelImageBlock.js";
import { SvgImageBlock } from "./SvgImageBlock.js";

const supportedBlocks: Record<string, BlockInterface> = { pixelImage: PixelImageBlock, svgImage: SvgImageBlock };

/** A pixel or SVG image, like `DamImageBlock` of `@dextinity/cms-admin`. The file the editor chooses decides which. */
export const DamImageBlock = createOneOfBlock({
    name: "DamImage",
    displayName: <FormattedMessage id="dextinity.blocks.damImage" defaultMessage="Image" />,
    category: BlockCategory.Media,
    supportedBlocks,
    allowEmpty: false,
    tags: [defineMessage({ id: "dextinity.damImageBlock.tag.image", defaultMessage: "Image" })],
});

DamImageBlock.AdminComponent = function DamImageBlockAdminComponent({ state, updateState }) {
    const activeBlock = state.attachedBlocks.find((block) => block.type === state.activeType);
    if (!activeBlock) {
        throw new Error(`No block found for type ${state.activeType}`);
    }

    if ((activeBlock.props as { damFile?: DamBlockFile }).damFile === undefined) {
        return (
            <BlocksFinalForm<{ damFile?: DamBlockFile }>
                onSubmit={({ damFile }) => {
                    if (damFile) {
                        const type = svgImageMimetypes.includes(damFile.mimetype) ? "svgImage" : "pixelImage";
                        updateState({ attachedBlocks: [{ type, props: { damFile } }], activeType: type });
                    }
                }}
                initialValues={{}}
            >
                <Field
                    name="damFile"
                    component={DamFileField}
                    fullWidth
                    buttonText={<FormattedMessage id="dextinity.blocks.image.chooseImage" defaultMessage="Choose image" />}
                    allowedMimetypes={[...pixelImageMimetypes, ...svgImageMimetypes]}
                />
            </BlocksFinalForm>
        );
    }

    const ActiveBlockAdminComponent = supportedBlocks[activeBlock.type].AdminComponent;
    return (
        <ActiveBlockAdminComponent
            state={activeBlock.props}
            updateState={(setStateAction) => {
                updateState({
                    attachedBlocks: [{ type: activeBlock.type, props: resolveNewState({ prevState: activeBlock.props, setStateAction }) }],
                    activeType: activeBlock.type,
                });
            }}
        />
    );
};

// Always "Image", not "SVG" for an SVG image
DamImageBlock.dynamicDisplayName = undefined;
