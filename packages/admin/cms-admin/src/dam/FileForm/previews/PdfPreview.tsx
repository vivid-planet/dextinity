import { styled } from "@mui/material/styles";

import type { DamFileDetails } from "../EditFile";

interface PdfPreviewProps {
    file: DamFileDetails;
}

export function PdfPreview({ file }: PdfPreviewProps) {
    return <PdfFrame src={file.fileUrl} title={file.name} />;
}

const PdfFrame = styled("iframe")`
    align-self: stretch;
    inline-size: 100%;
    min-block-size: 480px;
    border: 0;
    border-radius: var(--dextinity-radius-item);
`;
