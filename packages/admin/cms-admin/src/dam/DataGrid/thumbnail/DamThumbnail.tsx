import { File, Folder, FolderCopy, Pdf } from "@dextinity/admin-icons";
import { Fade, Popper, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type MouseEvent, useState } from "react";

import type { GQLDamFile, GQLDamFolder } from "../../../graphql.generated";
import { AudioThumbnail } from "./AudioThumbnail";
import type { GQLDamFileThumbnailFragment } from "./DamThumbnail.gql.generated";
import { VideoThumbnail } from "./VideoThumbnail";

export { damFileThumbnailFragment } from "./DamThumbnail.gql";

export const inboxFolderColor = "#952F80";

const ThumbnailWrapper = styled("div")`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    width: 36px;
    height: 36px;
`;

const ImageThumbnail = styled("img")`
    width: inherit;
    height: inherit;
    border-radius: inherit;
`;

const ImagePreview = styled("img")`
    max-width: 300px;
    max-height: 300px;
    padding: ${({ theme }) => theme.spacing(1.25)};
    margin-left: ${({ theme }) => theme.spacing(1)};
    background-color: ${({ theme }) => theme.palette.background.paper};
    box-shadow: ${({ theme }) => theme.shadows[1]};
`;

const ColoredFile = styled(File)`
    color: ${({ theme }) => theme.palette.primary.main};
`;

type DamThumbnailFolder = Pick<GQLDamFolder, "__typename" | "isInboxFromOtherScope">;
type DamThumbnailFile = Pick<GQLDamFile, "__typename" | "mimetype" | "fileUrl"> & { image: GQLDamFileThumbnailFragment | null };

interface DamThumbnailProps {
    asset: DamThumbnailFolder | DamThumbnailFile;
}

export const DamThumbnail = ({ asset }: DamThumbnailProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();

    const open = Boolean(anchorEl);

    const handleMouseOver = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMouseLeave = () => {
        setAnchorEl(null);
    };

    let thumbnail;
    if (asset.__typename === "DamFile") {
        if (asset.mimetype.startsWith("image/") && asset.image && asset.image.thumbnailUrl) {
            thumbnail = (
                <>
                    <ImageThumbnail onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave} src={asset.image.thumbnailUrl} />
                    <Popper sx={{ zIndex: 1301 }} open={open} anchorEl={anchorEl} placement="auto-end" transition>
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                                <ImagePreview src={asset.fileUrl || undefined} />
                            </Fade>
                        )}
                    </Popper>
                </>
            );
        } else if (asset.mimetype.startsWith("audio/")) {
            thumbnail = <AudioThumbnail />;
        } else if (asset.mimetype.startsWith("video/")) {
            thumbnail = <VideoThumbnail />;
        } else if (asset.mimetype === "application/pdf") {
            thumbnail = <Pdf htmlColor="#ce1f19" />;
        } else {
            thumbnail = <ColoredFile />;
        }
    } else if (asset.__typename === "DamFolder") {
        if (asset.isInboxFromOtherScope) {
            thumbnail = <FolderCopy htmlColor={theme.palette.highlight.purple} />;
        } else {
            thumbnail = <Folder />;
        }
    }

    return <ThumbnailWrapper>{thumbnail}</ThumbnailWrapper>;
};
