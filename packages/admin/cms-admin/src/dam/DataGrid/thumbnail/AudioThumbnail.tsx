import { Music } from "@dextinity/admin-icons";
import { styled } from "@mui/material/styles";

const AudioThumbnailWrapper = styled("div")`
    display: flex;
    justify-content: center;
    align-items: center;
    width: inherit;
    height: inherit;
    border-radius: inherit;
    border: solid 1px ${({ theme }) => theme.palette.grey[100]};
`;

const StyledMusicIcon = styled(Music)`
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.palette.primary.main};
`;

export const AudioThumbnail = () => {
    return (
        <AudioThumbnailWrapper>
            <StyledMusicIcon />
        </AudioThumbnailWrapper>
    );
};
