import { styled } from "@mui/material/styles";

import type { DamFileDetails } from "../EditFile";

const PdfPreviewWrapper = styled("div")`
    width: 100%;
    height: calc(100vh - 300px);
    overflow-y: auto;
`;

const PdfPreviewIFrame = styled("iframe")`
    width: inherit;
    height: inherit;
`;

interface PdfPreviewProps {
    file: DamFileDetails;
}

export const PdfPreview = ({ file }: PdfPreviewProps) => {
    return (
        <PdfPreviewWrapper>
            <PdfPreviewIFrame src={file.fileUrl} />
        </PdfPreviewWrapper>
    );
};
