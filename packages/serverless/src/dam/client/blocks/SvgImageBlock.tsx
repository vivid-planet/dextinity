import { Field } from "@dextinity/admin";
import { BlockCategory, type BlockInterface, BlocksFinalForm, createBlockSkeleton, SelectPreviewComponent } from "@dextinity/cms-admin";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { useDamApi } from "../DamApiProvider.js";
import { type DamBlockFile, damBlockFilePreview, loadDamBlockFile } from "./damBlockFile.js";
import { DamFileField } from "./DamFileField.js";
import { svgImageMimetypes } from "./damMimetypes.js";

export interface SvgImageBlockState {
    damFile?: DamBlockFile;
}

export interface SvgImageBlockOutput {
    damFileId?: string;
}

/** The SVG image block of `@dextinity/cms-admin` with the DAM's REST API */
export const SvgImageBlock: BlockInterface<SvgImageBlockOutput, SvgImageBlockState, SvgImageBlockOutput> = {
    ...createBlockSkeleton(),

    name: "SvgImage",

    displayName: <FormattedMessage id="dextinity.blocks.svgImage" defaultMessage="SVG" />,

    category: BlockCategory.Media,

    defaultValues: () => ({}),

    state2Output: ({ damFile }) => (damFile ? { damFileId: damFile.id } : {}),

    output2State: async ({ damFileId }, { apiUrl }) => {
        const damFile = damFileId ? await loadDamBlockFile(apiUrl, damFileId) : undefined;
        return damFile ? { damFile } : {};
    },

    createPreviewState: ({ damFile }, { apiUrl, parentUrl }) => ({
        damFile: damFile && damBlockFilePreview(damFile, apiUrl),
        adminMeta: { route: parentUrl },
    }),

    definesOwnPadding: true,

    AdminComponent: ({ state, updateState }) => {
        const { resolveUrl } = useDamApi();

        return (
            <SelectPreviewComponent>
                <BlocksFinalForm<SvgImageBlockState> onSubmit={({ damFile }) => updateState({ damFile })} initialValues={{ damFile: state.damFile }}>
                    <Field
                        name="damFile"
                        component={DamFileField}
                        fullWidth
                        buttonText={<FormattedMessage id="dextinity.blocks.image.chooseImage" defaultMessage="Choose image" />}
                        allowedMimetypes={svgImageMimetypes}
                        preview={state.damFile && <PreviewImage src={resolveUrl(state.damFile.fileUrl)} width="70" height="70" alt="" />}
                    />
                </BlocksFinalForm>
            </SelectPreviewComponent>
        );
    },

    previewContent: ({ damFile }, context) =>
        damFile && context
            ? [
                  { type: "image", content: { src: `${context.apiUrl}${damFile.fileUrl}`, width: 320, height: 320 } },
                  { type: "text", content: damFile.name },
              ]
            : [],

    extractTextContents: ({ damFile }) => [damFile?.altText, damFile?.title].filter((text): text is string => Boolean(text)),
};

const PreviewImage = styled("img")`
    object-fit: contain;
`;
