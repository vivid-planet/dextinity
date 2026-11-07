import { gql, useQuery } from "@apollo/client";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import type { DamFileDetails } from "../EditFile";
import { type GQLVideoPreviewCaptionsQuery, type GQLVideoPreviewCaptionsQueryVariables, namedOperations } from "./VideoPreview.generated";

interface VideoPreviewProps {
    file: DamFileDetails;
}

export const VideoPreviewCaptionsQueryName = namedOperations.Query.VideoPreviewCaptions;

const videoPreviewCaptionsQuery = gql`
    query VideoPreviewCaptions($id: ID!) {
        damFile(id: $id) {
            id
            alternativesForThisFile {
                id
                language
                type
                alternative {
                    id
                    fileUrl
                }
            }
        }
    }
`;

export function VideoPreview({ file }: VideoPreviewProps) {
    const { data } = useQuery<GQLVideoPreviewCaptionsQuery, GQLVideoPreviewCaptionsQueryVariables>(videoPreviewCaptionsQuery, {
        variables: { id: file.id },
    });

    return (
        <Video controls src={file.fileUrl}>
            {data?.damFile.alternativesForThisFile
                .filter((alternative) => alternative.type === "captions")
                .map((caption) => (
                    <track key={caption.id} src={caption.alternative.fileUrl} kind="captions" srcLang={caption.language} label={caption.language} />
                ))}
            <FormattedMessage
                id="dextinity.dam.file.unsupportedVideoTag"
                defaultMessage="Your browser does not support the video element. Please use another browser."
            />
        </Video>
    );
}

const Video = styled("video")`
    display: block;
    inline-size: 100%;
    max-block-size: 100%;
    border-radius: var(--dextinity-radius-item);
    background: var(--dextinity-color-surface-sunken);
`;
