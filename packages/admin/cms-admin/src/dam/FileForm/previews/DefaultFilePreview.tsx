import { AssetThumbnail } from "@dextinity/ui";
import { styled } from "@mui/material/styles";

import type { DamFileDetails } from "../EditFile";

interface DefaultFilePreviewProps {
    file: DamFileDetails;
}

export function DefaultFilePreview({ file }: DefaultFilePreviewProps) {
    return (
        <Root>
            <AssetThumbnail type="document" fileType={file.name.split(".").pop()?.toUpperCase()} />
        </Root>
    );
}

const Root = styled("div")`
    inline-size: min(100%, 280px);
`;
