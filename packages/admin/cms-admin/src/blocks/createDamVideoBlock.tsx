import { gql } from "@apollo/client";
import { Banner, Icon } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { deepClone } from "@mui/x-data-grid/internals";
import { Field } from "react-final-form";
import { defineMessage, FormattedMessage, type MessageDescriptor } from "react-intl";

import type { DamVideoBlockData, DamVideoBlockInput } from "../blocks.generated";
import { useVideoPerformanceWarning } from "../dam/config/damConfig";
import { FileField } from "../form/file/FileField";
import { useBlockAdminComponentPaper } from "./common/BlockAdminComponentPaper";
import { BlockAdminComponentSection } from "./common/BlockAdminComponentSection";
import type { GQLVideoBlockDamFileQuery, GQLVideoBlockDamFileQueryVariables } from "./createDamVideoBlock.generated";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { VideoOptionsFields } from "./helpers/VideoOptionsFields";
import { PixelImageBlock } from "./PixelImageBlock";
import { BlockCategory, type BlockDependency, type BlockInterface, type BlockPreviewStateInterface, type BlockState } from "./types";
import { resolveNewState } from "./utils";

export type DamVideoBlockState = Omit<DamVideoBlockData, "previewImage"> & { previewImage?: BlockState<typeof PixelImageBlock> };

/**
 * What the editor can set besides the video file itself. Disable anything the site implementation doesn't use.
 *
 * A disabled option is neither offered in the editor nor sent to the API, so disable the same options in the
 * API block, which rejects input for an option it doesn't have.
 */
interface DamVideoBlockFactoryOptions {
    /**
     * The block's name. Must match the name of the block created with `createDamVideoBlock` in the API.
     * @default "DamVideo"
     */
    name?: string;
    /**
     * The playback options autoplay, loop and show controls. Bundled because autoplay and show controls
     * depend on each other (a video with neither can't be played), so they're all offered or none.
     * @default true
     */
    controls?: boolean;
    /**
     * The poster image shown before playback.
     * @default true
     */
    previewImage?: boolean;
    tags?: Array<MessageDescriptor | string>;
}

export const createDamVideoBlock = (
    {
        name = "DamVideo",
        controls: supportsControls = true,
        previewImage: supportsPreviewImage = true,
        tags = [defineMessage({ id: "dextinity.damVideoBlock.tag.video", defaultMessage: "Video" })],
    }: DamVideoBlockFactoryOptions = {},
    override?: (
        block: BlockInterface<DamVideoBlockData, DamVideoBlockState, DamVideoBlockInput>,
    ) => BlockInterface<DamVideoBlockData, DamVideoBlockState, DamVideoBlockInput>,
): BlockInterface<DamVideoBlockData, DamVideoBlockState, DamVideoBlockInput> => {
    const DamVideoBlock: BlockInterface<DamVideoBlockData, DamVideoBlockState, DamVideoBlockInput> = {
        ...createBlockSkeleton(),

        name,

        displayName: <FormattedMessage id="dextinity.blocks.damVideo" defaultMessage="Video (CMS Asset)" />,

        defaultValues: () => ({ showControls: true, ...(supportsPreviewImage ? { previewImage: PixelImageBlock.defaultValues() } : {}) }),

        category: BlockCategory.Media,

        input2State: ({ previewImage, ...input }) => ({
            ...input,
            ...(supportsPreviewImage ? { previewImage: PixelImageBlock.input2State(previewImage) } : {}),
        }),

        state2Output: (state) => {
            const output = {
                damFileId: state.damFile?.id,
                ...(supportsPreviewImage && state.previewImage ? { previewImage: PixelImageBlock.state2Output(state.previewImage) } : {}),
                ...(supportsControls ? { autoplay: state.autoplay, loop: state.loop, showControls: state.showControls } : {}),
            };

            // DamVideoBlockInput is generated from the exported DamVideoBlock, which always has a preview image
            return output as DamVideoBlockInput;
        },

        output2State: async (output, context) => {
            if (!output.damFileId) {
                return {
                    autoplay: output.autoplay,
                    loop: output.loop,
                    showControls: output.showControls,
                    ...(supportsPreviewImage ? { previewImage: await PixelImageBlock.output2State(output.previewImage, context) } : {}),
                };
            }

            const { data } = await context.apolloClient.query<GQLVideoBlockDamFileQuery, GQLVideoBlockDamFileQueryVariables>({
                query: gql`
                    query VideoBlockDamFile($id: ID!) {
                        damFile(id: $id) {
                            id
                            name
                            size
                            mimetype
                            contentHash
                            title
                            altText
                            archived
                            fileUrl
                        }
                    }
                `,
                variables: { id: output.damFileId },
            });

            // TODO consider throwing an error
            // TODO fix typing: generated GraphQL files use null, we use undefined, e.g. title: string | null vs title?: string
            const damFile = data.damFile as unknown as DamVideoBlockData["damFile"];

            return {
                damFile,
                autoplay: output.autoplay,
                loop: output.loop,
                showControls: output.showControls,
                ...(supportsPreviewImage ? { previewImage: await PixelImageBlock.output2State(output.previewImage, context) } : {}),
            };
        },

        createPreviewState: ({ previewImage, ...state }, previewContext) => {
            const previewState = {
                ...state,
                autoplay: false,
                loop: false,
                ...(previewImage ? { previewImage: PixelImageBlock.createPreviewState(previewImage, previewContext) } : {}),
                adminMeta: { route: previewContext.parentUrl },
            };

            // DamVideoBlockData is generated from the exported DamVideoBlock, which always has a preview image
            return previewState as DamVideoBlockData & BlockPreviewStateInterface;
        },

        dependencies: (state) => {
            const dependencies: BlockDependency[] = [];

            if (state.damFile?.id) {
                dependencies.push({
                    targetGraphqlObjectType: "DamFile",
                    id: state.damFile.id,
                    data: {
                        damFile: state.damFile,
                    },
                });
            }

            if (state.previewImage) {
                dependencies.push(...(PixelImageBlock.dependencies?.(state.previewImage) ?? []));
            }

            return dependencies;
        },

        replaceDependenciesInOutput: (output, replacements) => {
            const clonedOutput: DamVideoBlockInput = deepClone(output);
            const replacement = replacements.find((replacement) => replacement.type === "DamFile" && replacement.originalId === output.damFileId);

            if (replacement) {
                clonedOutput.damFileId = replacement.replaceWithId;
            }

            if (supportsPreviewImage) {
                clonedOutput.previewImage = PixelImageBlock.replaceDependenciesInOutput(output.previewImage, replacements);
            }

            return clonedOutput;
        },

        definesOwnPadding: true,

        AdminComponent: ({ state, updateState }) => {
            const isInPaper = useBlockAdminComponentPaper();
            const { isVideoTooLarge } = useVideoPerformanceWarning();

            return (
                <Root data-padding={isInPaper ? "default" : "none"}>
                    <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                        {state.damFile && isVideoTooLarge(state.damFile) && (
                            <Banner tone="warning">
                                <strong>
                                    <FormattedMessage id="dextinity.dam.videoPerformanceWarning.title" defaultMessage="Large video file" />
                                </strong>{" "}
                                <FormattedMessage
                                    id="dextinity.dam.videoPerformanceWarning.text"
                                    defaultMessage="This video is very large. Videos are delivered without optimization, which can lead to poor loading performance."
                                />
                            </Banner>
                        )}
                        <Field name="damFile" component={FileField} allowedMimetypes={["video/mp4", "video/webm"]} preview={<Icon name="video" />} />
                        {supportsControls && <VideoOptionsFields />}
                        {supportsPreviewImage && state.previewImage && (
                            <BlockAdminComponentSection
                                title={<FormattedMessage id="dextinity.blocks.video.previewImage" defaultMessage="Preview Image" />}
                            >
                                <PixelImageBlock.AdminComponent
                                    state={state.previewImage}
                                    updateState={(setStateAction) => {
                                        updateState((prevState) => ({
                                            ...prevState,
                                            previewImage: resolveNewState({
                                                prevState: prevState.previewImage ?? PixelImageBlock.defaultValues(),
                                                setStateAction,
                                            }),
                                        }));
                                    }}
                                />
                            </BlockAdminComponentSection>
                        )}
                    </BlocksFinalForm>
                </Root>
            );
        },

        previewContent: (state) => (state.damFile ? [{ type: "text", content: state.damFile.name }] : []),

        extractTextContents: (state) => {
            const contents = [];

            if (state.damFile?.altText) {
                contents.push(state.damFile.altText);
            }
            if (state.damFile?.title) {
                contents.push(state.damFile.title);
            }

            return contents;
        },

        tags,
    };

    if (override) {
        return override(DamVideoBlock);
    }

    return DamVideoBlock;
};

const Root = styled("div")`
    display: grid;
    gap: var(--dextinity-space-4);

    &[data-padding="default"] {
        padding: var(--dextinity-space-4) var(--dextinity-space-4) 0;
    }
`;
