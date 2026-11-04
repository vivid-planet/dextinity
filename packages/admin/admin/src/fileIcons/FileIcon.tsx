import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

import { Excel } from "./Excel";
import { File } from "./File";
import { Jpg } from "./Jpg";
import { Pdf } from "./Pdf";
import { Png } from "./Png";
import { Powerpoint } from "./Powerpoint";
import { Word } from "./Word";
import { Zip } from "./Zip";

interface IComponents {
    [fileType: string]: ComponentType;
}
const components: IComponents = {
    "application/msexcel": Excel,
    "application/vnd.ms-excel": Excel,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": Excel,
    "application/vnd.oasis.opendocument.spreadsheet": Excel,

    "application/msword": Word,
    "application/vnd.ms-word": Word,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": Word,
    "application/vnd.oasis.opendocument.text": Word,

    "application/mspowerpoint": Powerpoint,
    "application/vnd.ms-powerpoint": Powerpoint,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": Powerpoint,
    "application/vnd.oasis.opendocument.presentation": Powerpoint,

    "application/zip": Zip,
    "application/pdf": Pdf,
    "image/png": Png,
    "image/jpeg": Jpg,
    "image/jpg": Jpg,
};

interface IProps extends SvgIconProps {
    fileType: string;
}

export const FileIcon = ({ fileType, ...rest }: IProps) => {
    if (components[fileType]) {
        const Cmp = components[fileType];
        return <Cmp {...rest} />;
    }
    return <File {...rest} />;
};
