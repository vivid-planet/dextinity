import { Music } from "@dextinity/admin-icons";
import { styled } from "@mui/material/styles";

import type { DamFileDetails } from "../EditFile";

const AudioPreviewWrapper = styled("div")`
    width: 100%;
    min-height: 400px;
    background-color: ${({ theme }) => theme.palette.grey[50]};

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const MusicIconContainer = styled("div")`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const MusicIconWrapper = styled("div")`
    width: 150px;
    height: 150px;
    background: white;
    border-radius: 10px;

    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
`;

const StyledMusicIcon = styled(Music)`
    width: 54px;
    height: 54px;
    color: ${({ theme }) => theme.palette.primary.main};
`;

const StyledAudio = styled("audio")`
    width: inherit;
`;

interface AudioPreviewProps {
    file: DamFileDetails;
}

export const AudioPreview = ({ file }: AudioPreviewProps) => {
    return (
        <AudioPreviewWrapper>
            <MusicIconContainer>
                <MusicIconWrapper>
                    <StyledMusicIcon />
                </MusicIconWrapper>
            </MusicIconContainer>
            <StyledAudio controls>
                <source src={file.fileUrl} type={file.mimetype} />
            </StyledAudio>
        </AudioPreviewWrapper>
    );
};
