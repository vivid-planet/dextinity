import { gql, useQuery } from "@apollo/client";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import type { DamFileDetails } from "../EditFile";
import { type GQLVideoPreviewCaptionsQuery, type GQLVideoPreviewCaptionsQueryVariables, namedOperations } from "./VideoPreview.generated";

const VideoPreviewWrapper = styled("div")`
    width: 100%;
    max-width: 60vw;
    min-height: 200px;
    background-color: ${({ theme }) => theme.palette.grey[50]};
    display: flex;
    flex-direction: column;
`;

const StyledVideo = styled("video")`
    width: 100%;
`;

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

export const VideoPreview = ({ file }: VideoPreviewProps) => {
    const { data } = useQuery<GQLVideoPreviewCaptionsQuery, GQLVideoPreviewCaptionsQueryVariables>(videoPreviewCaptionsQuery, {
        variables: {
            id: file.id,
        },
    });

    return (
        <VideoPreviewWrapper>
            <StyledVideo controls src={file.fileUrl}>
                {data?.damFile.alternativesForThisFile
                    .filter((alternative) => alternative.type === "captions")
                    .map((caption) => {
                        return <track key={caption.id} src={caption.alternative.fileUrl} kind="captions" srcLang={caption.language} />;
                    })}
                <FormattedMessage
                    id="dextinity.dam.file.unsupportedVideoTag"
                    defaultMessage="Your browser does not support the video element. Please use another browser."
                />
            </StyledVideo>
        </VideoPreviewWrapper>
    );
};
