import { FileIcon } from "@dextinity/admin";
import { Folder } from "@dextinity/admin-icons";
import { styled } from "@mui/material/styles";

import { createImageUrl, type DamItem } from "./damApi.types.js";
import { useDamApi } from "./DamApiProvider.js";

export function DamThumbnail({ item }: { item: DamItem }) {
    const { resolveUrl } = useDamApi();

    if (item.__typename === "DamFolder") {
        return (
            <ThumbnailWrapper>
                <Folder color="primary" />
            </ThumbnailWrapper>
        );
    }

    return (
        <ThumbnailWrapper>
            {item.image ? (
                <ThumbnailImage src={resolveUrl(createImageUrl(item.image, { width: 96 }))} alt="" />
            ) : (
                <FileIcon fileType={item.mimetype} />
            )}
        </ThumbnailWrapper>
    );
}

const ThumbnailWrapper = styled("div")`
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const ThumbnailImage = styled("img")`
    width: inherit;
    height: inherit;
    object-fit: cover;
    border-radius: inherit;
`;
