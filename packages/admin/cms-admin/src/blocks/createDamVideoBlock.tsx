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
import { BlockCategory, type BlockDependency, type BlockInterface, type BlockState } from "./types";
import { resolveNewState } from "./utils";

export type DamVideoBlockState = Omit<DamVideoBlockData, "previewImage"> & { previewImage: BlockState<typeof PixelImageBlock> };

/**
 * What the editor can set besides the video file itself:
 * - `"controls"` — the playback options autoplay, loop and show controls. Bundled because autoplay and
 *   show controls depend on each other (a video with neither can't be played), so they're all offered or none.
 * - `"previewImage"` — the poster image shown before playback.
 */
type DamVideoBlockSupports = "controls" | "previewImage";

const defaultSupports: DamVideoBlockSupports[] = ["controls", "previewImage"];

interface DamVideoBlockFactoryOptions {
    /**
     * What the editor can set besides the video file itself. Leave out anything the site implementation
     * doesn't use, for instance `["controls"]` for a site that renders no poster image, or `[]` for a site
     * that only reads the file's URL.
     *
     * Values that are already stored are kept as they are, the editor just can't change them anymore.
     * The preview image is always part of the block's data, leaving it out only hides it from the editor.
     * @default ["controls", "previewImage"]
     */
    supports?: DamVideoBlockSupports[];
    tags?: Array<MessageDescriptor | string>;
}

export const createDamVideoBlock = (
    {
        supports = defaultSupports,
        tags = [defineMessage({ id: "dextinity.damVideoBlock.tag.video", defaultMessage: "Video" })],
    }: DamVideoBlockFactoryOptions = {},
    override?: (
        block: BlockInterface<DamVideoBlockData, DamVideoBlockState, DamVideoBlockInput>,
    ) => BlockInterface<DamVideoBlockData, DamVideoBlockState, DamVideoBlockInput>,
): BlockInterface<DamVideoBlockData, DamVideoBlockState, DamVideoBlockInput> => {
    const DamVideoBlock: BlockInterface<DamVideoBlockData, DamVideoBlockState, DamVideoBlockInput> = {
        ...createBlockSkeleton(),

        name: "DamVideo",

        displayName: <FormattedMessage id="dextinity.blocks.damVideo" defaultMessage="Video (CMS Asset)" />,

        defaultValues: () => ({ showControls: true, previewImage: PixelImageBlock.defaultValues() }),

        category: BlockCategory.Media,

        input2State: (input) => ({ ...input, previewImage: PixelImageBlock.input2State(input.previewImage) }),

        state2Output: (state) => ({
            damFileId: state.damFile?.id,
            previewImage: PixelImageBlock.state2Output(state.previewImage),
            autoplay: state.autoplay,
            loop: state.loop,
            showControls: state.showControls,
        }),

        output2State: async (output, context) => {
            if (!output.damFileId) {
                return {
                    autoplay: output.autoplay,
                    loop: output.loop,
                    showControls: output.showControls,
                    previewImage: await PixelImageBlock.output2State(output.previewImage, context),
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
                previewImage: await PixelImageBlock.output2State(output.previewImage, context),
            };
        },

        createPreviewState: (state, previewContext) => ({
            ...state,
            autoplay: false,
            loop: false,
            previewImage: PixelImageBlock.createPreviewState(state.previewImage, previewContext),
            adminMeta: { route: previewContext.parentUrl },
        }),

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

            dependencies.push(...(PixelImageBlock.dependencies?.(state.previewImage) ?? []));

            return dependencies;
        },

        replaceDependenciesInOutput: (output, replacements) => {
            const clonedOutput: DamVideoBlockInput = deepClone(output);
            const replacement = replacements.find((replacement) => replacement.type === "DamFile" && replacement.originalId === output.damFileId);

            if (replacement) {
                clonedOutput.damFileId = replacement.replaceWithId;
            }

            clonedOutput.previewImage = PixelImageBlock.replaceDependenciesInOutput(output.previewImage, replacements);

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
                        {supports.includes("controls") && <VideoOptionsFields />}
                        {supports.includes("previewImage") && (
                            <BlockAdminComponentSection
                                title={<FormattedMessage id="dextinity.blocks.video.previewImage" defaultMessage="Preview Image" />}
                            >
                                <PixelImageBlock.AdminComponent
                                    state={state.previewImage}
                                    updateState={(setStateAction) => {
                                        updateState({ ...state, previewImage: resolveNewState({ prevState: state.previewImage, setStateAction }) });
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
