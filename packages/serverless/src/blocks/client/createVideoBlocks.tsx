import { Field, FinalFormInput } from "@dextinity/admin";
import {
    BlockAdminComponentSection,
    BlockCategory,
    type BlockInterface,
    BlocksFinalForm,
    createBlockSkeleton,
    resolveNewState,
    SelectPreviewComponent,
    useBlockAdminComponentPaper,
} from "@dextinity/cms-admin";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { VideoOptionsFields } from "./VideoOptionsFields.js";

interface VideoBlockState<TPreviewImageState> {
    autoplay?: boolean;
    showControls?: boolean;
    loop?: boolean;
    previewImage: TPreviewImageState;
}

interface CreateExternalVideoBlockOptions {
    name: string;
    displayName: ReactNode;
    identifierField: string;
    identifierLabel: ReactNode;
    invalidIdentifierMessage: ReactNode;
    isValidIdentifier: (value: string) => boolean;
    previewImage: BlockInterface;
    tags: string[];
}

/** The YouTube and Vimeo blocks of `@dextinity/cms-admin` with the preview image block as option instead of the GraphQL image block */
function createExternalVideoBlock({
    name,
    displayName,
    identifierField,
    identifierLabel,
    invalidIdentifierMessage,
    isValidIdentifier,
    previewImage: PreviewImageBlock,
    tags,
}: CreateExternalVideoBlockOptions): BlockInterface {
    type State = VideoBlockState<unknown> & Record<string, unknown>;
    const identifierOf = (state: State) => state[identifierField] as string | undefined;

    const VideoBlock: BlockInterface<State, State, State> = {
        ...createBlockSkeleton(),
        name,
        displayName,
        category: BlockCategory.Media,
        defaultValues: () => ({ showControls: true, previewImage: PreviewImageBlock.defaultValues() }),
        input2State: (input) => ({ ...input, previewImage: PreviewImageBlock.input2State(input.previewImage) }),
        state2Output: (state) => ({ ...state, previewImage: PreviewImageBlock.state2Output(state.previewImage) }),
        output2State: async (output, context) => ({ ...output, previewImage: await PreviewImageBlock.output2State(output.previewImage, context) }),
        createPreviewState: (state, previewContext) => ({
            ...state,
            autoplay: false,
            previewImage: PreviewImageBlock.createPreviewState(state.previewImage, previewContext),
            adminMeta: { route: previewContext.parentUrl },
        }),
        definesOwnPadding: true,
        isValid: (state) => {
            const identifier = identifierOf(state);
            return !identifier || isValidIdentifier(identifier);
        },
        AdminComponent: ({ state, updateState }) => {
            const isInPaper = useBlockAdminComponentPaper();

            return (
                <Box padding={isInPaper ? 3 : 0} pb={0}>
                    <SelectPreviewComponent>
                        <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                            <Field
                                name={identifierField}
                                label={identifierLabel}
                                validate={(value?: string) => (!value || isValidIdentifier(value) ? undefined : invalidIdentifierMessage)}
                                component={FinalFormInput}
                                fullWidth
                                disableContentTranslation
                            />
                            <VideoOptionsFields />
                        </BlocksFinalForm>
                        <BlockAdminComponentSection
                            title={<FormattedMessage id="dextinity.blocks.video.previewImage" defaultMessage="Preview Image" />}
                        >
                            <PreviewImageBlock.AdminComponent
                                state={state.previewImage}
                                updateState={(setStateAction) => {
                                    updateState({ ...state, previewImage: resolveNewState({ prevState: state.previewImage, setStateAction }) });
                                }}
                            />
                        </BlockAdminComponentSection>
                    </SelectPreviewComponent>
                </Box>
            );
        },
        previewContent: (state) => [{ type: "text", content: identifierOf(state) ?? "" }],
        extractTextContents: (state, options) => PreviewImageBlock.extractTextContents?.(state.previewImage, options) ?? [],
        tags,
    };

    return VideoBlock;
}

const youTubeIdentifierLength = 11;

// The pattern of `YouTubeVideoBlock` of `@dextinity/cms-admin`, from https://stackoverflow.com/a/51870158
const youTubeUrlPattern =
    /(https?:\/\/)?(((m|www)\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-zA-Z-]+)/;

export function createYouTubeVideoBlock({ previewImage }: { previewImage: BlockInterface }): BlockInterface {
    return createExternalVideoBlock({
        name: "YouTubeVideo",
        displayName: <FormattedMessage id="dextinity.blocks.youTubeVideo" defaultMessage="Video (YouTube)" />,
        identifierField: "youtubeIdentifier",
        identifierLabel: <FormattedMessage id="dextinity.blocks.youTubeVideo.youtubeIdentifier" defaultMessage="YouTube URL or YouTube Video ID" />,
        invalidIdentifierMessage: (
            <FormattedMessage id="dextinity.blocks.youTubeVideo.validation" defaultMessage="Should be a valid YouTube URL or identifier" />
        ),
        isValidIdentifier: (value) =>
            value.length === youTubeIdentifierLength || value.match(youTubeUrlPattern)?.[8].length === youTubeIdentifierLength,
        previewImage,
        tags: ["YouTube"],
    });
}

const vimeoUrlPattern = /^(https?:\/\/)?((www\.|player\.)?vimeo\.com\/?(showcase\/)*([0-9a-z]*\/)*([0-9]{6,11})[?]?.*)$/;
const vimeoIdPattern = /^([0-9]{6,11})$/;

export function createVimeoVideoBlock({ previewImage }: { previewImage: BlockInterface }): BlockInterface {
    return createExternalVideoBlock({
        name: "VimeoVideo",
        displayName: <FormattedMessage id="dextinity.blocks.vimeoVideo" defaultMessage="Video (Vimeo)" />,
        identifierField: "vimeoIdentifier",
        identifierLabel: <FormattedMessage id="dextinity.blocks.vimeoVideo.vimeoIdentifier" defaultMessage="Vimeo URL or Vimeo Video ID" />,
        invalidIdentifierMessage: (
            <FormattedMessage id="dextinity.blocks.vimeoVideo.validation" defaultMessage="Should be a valid Vimeo URL or identifier" />
        ),
        isValidIdentifier: (value) => vimeoUrlPattern.test(value) || vimeoIdPattern.test(value),
        previewImage,
        tags: ["Vimeo"],
    });
}
