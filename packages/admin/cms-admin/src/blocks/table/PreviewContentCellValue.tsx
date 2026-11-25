import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { useBlockContext } from "../context/useBlockContext";
import { type BlockInterface, isPreviewContentImageRule } from "../types";
import { getPlainTexts } from "./utils/createTablePreviewText";

type Props = {
    block: BlockInterface;
    state: unknown;
};

export const PreviewContentCellValue = ({ block, state }: Props) => {
    const context = useBlockContext();
    const previewContent = block.previewContent(state, context);
    const images = previewContent.filter(isPreviewContentImageRule);
    const texts = getPlainTexts(previewContent).filter((text) => text.length > 0);

    return (
        <Root>
            {images.map(({ content }) => (
                <PreviewImage key={content.src} src={content.src} alt="" />
            ))}
            {texts.length > 0 && (
                <Typography variant="body2" noWrap>
                    {texts.join(", ")}
                </Typography>
            )}
        </Root>
    );
};

const Root = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    minWidth: 0,
}));

const PreviewImage = styled("img")({
    height: 36,
    width: 36,
    objectFit: "cover",
});
