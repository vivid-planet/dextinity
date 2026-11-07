import { Icon } from "@dextinity/ui";
import { styled } from "@mui/material/styles";

import type { DamFileDetails } from "../EditFile";

interface AudioPreviewProps {
    file: DamFileDetails;
}

export function AudioPreview({ file }: AudioPreviewProps) {
    return (
        <Root>
            <Artwork>
                <Icon name="music" size="large" />
            </Artwork>
            <Audio controls>
                <source src={file.fileUrl} type={file.mimetype} />
            </Audio>
        </Root>
    );
}

const Root = styled("div")`
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    justify-items: center;
    gap: var(--dextinity-space-4);
    inline-size: 100%;
    block-size: 100%;
`;

const Artwork = styled("div")`
    display: grid;
    place-items: center;
    align-self: center;
    inline-size: 160px;
    aspect-ratio: 1;
    border-radius: var(--dextinity-radius-panel);
    background: var(--dextinity-color-surface);
    color: var(--dextinity-color-accent);
    box-shadow: var(--dextinity-shadow-1);
`;

const Audio = styled("audio")`
    inline-size: 100%;
`;
