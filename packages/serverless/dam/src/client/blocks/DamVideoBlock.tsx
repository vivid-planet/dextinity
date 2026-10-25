import { Field } from "@dextinity/admin";
import { Video } from "@dextinity/admin-icons";
import {
    BlockAdminComponentSection,
    BlockCategory,
    type BlockInterface,
    BlocksFinalForm,
    createBlockSkeleton,
    resolveNewState,
    useBlockAdminComponentPaper,
} from "@dextinity/cms-admin";
import { VideoOptionsFields } from "@dextinity/serverless-blocks/client";
import { Box } from "@mui/material";
import { defineMessage, FormattedMessage } from "react-intl";

import { type DamBlockFile, damBlockFilePreview, loadDamBlockFile } from "./damBlockFile.js";
import { DamFileField } from "./DamFileField.js";
import { videoMimetypes } from "./damMimetypes.js";
import { PixelImageBlock, type PixelImageBlockOutput, type PixelImageBlockState } from "./PixelImageBlock.js";

interface VideoOptions {
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
}

export interface DamVideoBlockState extends VideoOptions {
    damFile?: DamBlockFile;
    previewImage: PixelImageBlockState;
}

export interface DamVideoBlockOutput extends VideoOptions {
    damFileId?: string;
    previewImage: PixelImageBlockOutput;
}

/** The video block of `@dextinity/cms-admin` (`createDamVideoBlock`) with the DAM's REST API */
export const DamVideoBlock: BlockInterface<DamVideoBlockOutput, DamVideoBlockState, DamVideoBlockOutput> = {
    ...createBlockSkeleton(),

    name: "DamVideo",

    displayName: <FormattedMessage id="dextinity.blocks.damVideo" defaultMessage="Video" />,

    category: BlockCategory.Media,

    tags: [defineMessage({ id: "dextinity.damVideoBlock.tag.video", defaultMessage: "Video" })],

    defaultValues: () => ({ showControls: true, previewImage: PixelImageBlock.defaultValues() }),

    state2Output: ({ damFile, previewImage, ...options }) => ({
        ...options,
        damFileId: damFile?.id,
        previewImage: PixelImageBlock.state2Output(previewImage),
    }),

    output2State: async ({ damFileId, previewImage, ...options }, context) => ({
        ...options,
        damFile: damFileId ? await loadDamBlockFile(context.apiUrl, damFileId) : undefined,
        previewImage: await PixelImageBlock.output2State(previewImage, context),
    }),

    // Like `createDamVideoBlock` of `@dextinity/cms-admin`: the preview doesn't play the video by itself
    createPreviewState: ({ damFile, previewImage, ...options }, previewContext) => ({
        ...options,
        autoplay: false,
        loop: false,
        damFile: damFile && damBlockFilePreview(damFile, previewContext.apiUrl),
        previewImage: PixelImageBlock.createPreviewState(previewImage, previewContext),
        adminMeta: { route: previewContext.parentUrl },
    }),

    definesOwnPadding: true,

    AdminComponent: ({ state, updateState }) => {
        const isInPaper = useBlockAdminComponentPaper();

        return (
            <Box padding={isInPaper ? 3 : 0} pb={0}>
                <BlocksFinalForm<DamVideoBlockState> onSubmit={updateState} initialValues={state}>
                    <Field
                        name="damFile"
                        component={DamFileField}
                        fullWidth
                        allowedMimetypes={videoMimetypes}
                        preview={<Video fontSize="large" color="primary" />}
                    />
                    <VideoOptionsFields />
                </BlocksFinalForm>
                <BlockAdminComponentSection title={<FormattedMessage id="dextinity.blocks.video.previewImage" defaultMessage="Preview Image" />}>
                    <PixelImageBlock.AdminComponent
                        state={state.previewImage}
                        updateState={(setStateAction) => {
                            updateState({ ...state, previewImage: resolveNewState({ prevState: state.previewImage, setStateAction }) });
                        }}
                    />
                </BlockAdminComponentSection>
            </Box>
        );
    },

    previewContent: ({ damFile }) => (damFile ? [{ type: "text", content: damFile.name }] : []),

    extractTextContents: ({ damFile }) => [damFile?.altText, damFile?.title].filter((text): text is string => Boolean(text)),
};
