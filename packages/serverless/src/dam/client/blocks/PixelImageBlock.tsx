import { Field } from "@dextinity/admin";
import { Crop } from "@dextinity/admin-icons";
import {
    BlockCategory,
    type BlockInterface,
    BlocksFinalForm,
    createBlockSkeleton,
    EditImageDialog,
    SelectPreviewComponent,
} from "@dextinity/cms-admin";
import { styled } from "@mui/material/styles";
import { type ComponentProps, useState } from "react";
import { FormattedMessage } from "react-intl";

import { createImageUrl, createImageUrlTemplate } from "../damApi.types.js";
import { useDamApi } from "../DamApiProvider.js";
import { type DamBlockFile, damBlockFilePreview, type DamImageCropArea, loadDamBlockFile } from "./damBlockFile.js";
import { DamFileField } from "./DamFileField.js";
import { pixelImageMimetypes } from "./damMimetypes.js";

export interface PixelImageBlockState {
    damFile?: DamBlockFile;
    /** Overrides the crop area of the file */
    cropArea?: DamImageCropArea;
}

export interface PixelImageBlockOutput {
    damFileId?: string;
    cropArea?: DamImageCropArea;
}

// Typed with the GraphQL enum of the focal points and without null, the values are the same
type EditImageDialogCropArea = NonNullable<ComponentProps<typeof EditImageDialog>["inheritedDamSettings"]>["cropArea"];

const previewSize = 320;

function createPreviewUrl({ damFile, cropArea }: PixelImageBlockState, resolveUrl: (path: string) => string): string | undefined {
    return damFile?.image ? resolveUrl(createImageUrl(damFile.image, { width: previewSize, cropArea })) : undefined;
}

/** The image block of `@dextinity/cms-admin` with the DAM's REST API: the state holds the file, the output only its ID */
export const PixelImageBlock: BlockInterface<PixelImageBlockOutput, PixelImageBlockState, PixelImageBlockOutput> = {
    ...createBlockSkeleton(),

    name: "Image",

    displayName: <FormattedMessage id="dextinity.blocks.image" defaultMessage="Image" />,

    category: BlockCategory.Media,

    defaultValues: () => ({}),

    state2Output: ({ damFile, cropArea }) => (damFile ? { damFileId: damFile.id, cropArea } : {}),

    output2State: async ({ damFileId, cropArea }, { apiUrl }) => {
        const damFile = damFileId ? await loadDamBlockFile(apiUrl, damFileId) : undefined;
        return damFile ? { damFile, cropArea } : {};
    },

    createPreviewState: ({ damFile, cropArea }, { apiUrl, parentUrl }) => ({
        damFile: damFile && damBlockFilePreview(damFile, apiUrl),
        cropArea,
        urlTemplate: damFile?.image ? `${apiUrl}${createImageUrlTemplate(damFile.image, cropArea)}` : undefined,
        adminMeta: { route: parentUrl },
    }),

    definesOwnPadding: true,

    AdminComponent: ({ state, updateState }) => {
        const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
        const { resolveUrl } = useDamApi();
        const previewUrl = createPreviewUrl(state, resolveUrl);
        const image = state.damFile?.image;

        return (
            <SelectPreviewComponent>
                <BlocksFinalForm<{ damFile?: DamBlockFile }>
                    // The crop area of another file doesn't fit
                    onSubmit={({ damFile }) => updateState({ damFile, cropArea: undefined })}
                    initialValues={{ damFile: state.damFile }}
                >
                    <Field
                        name="damFile"
                        component={DamFileField}
                        fullWidth
                        buttonText={<FormattedMessage id="dextinity.blocks.image.chooseImage" defaultMessage="Choose image" />}
                        allowedMimetypes={pixelImageMimetypes}
                        preview={previewUrl && <PreviewImage src={previewUrl} width="70" height="70" alt="" />}
                        menuActions={[
                            {
                                label: <FormattedMessage id="dextinity.blocks.image.cropImage" defaultMessage="Crop image" />,
                                icon: <Crop />,
                                onClick: () => setIsCropDialogOpen(true),
                            },
                        ]}
                    />
                </BlocksFinalForm>
                {isCropDialogOpen && state.damFile && image && (
                    <EditImageDialog
                        image={{
                            name: state.damFile.name,
                            url: resolveUrl(state.damFile.fileUrl),
                            width: image.width,
                            height: image.height,
                            size: state.damFile.size,
                        }}
                        damFileId={state.damFile.id}
                        initialValues={{
                            useInheritedDamSettings: state.cropArea === undefined,
                            cropArea: (state.cropArea ?? image.cropArea) as EditImageDialogCropArea,
                        }}
                        inheritedDamSettings={{ cropArea: image.cropArea as EditImageDialogCropArea }}
                        onSubmit={(cropArea) => {
                            updateState((previousState) => ({ ...previousState, cropArea }));
                            setIsCropDialogOpen(false);
                        }}
                        onClose={() => setIsCropDialogOpen(false)}
                    />
                )}
            </SelectPreviewComponent>
        );
    },

    previewContent: (state, context) => {
        const previewUrl = context && createPreviewUrl(state, (path) => `${context.apiUrl}${path}`);
        if (!state.damFile || !previewUrl) {
            return [];
        }
        return [
            { type: "image", content: { src: previewUrl, width: previewSize, height: previewSize } },
            { type: "text", content: state.damFile.name },
        ];
    },

    extractTextContents: ({ damFile }) => [damFile?.altText, damFile?.title].filter((text): text is string => Boolean(text)),
};

const PreviewImage = styled("img")`
    object-fit: cover;
`;
