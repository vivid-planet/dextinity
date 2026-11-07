import { KeyValueList, type KeyValueListItem } from "@dextinity/ui";
import { isDateString } from "class-validator";
import { FormattedDate, useIntl } from "react-intl";

import { formatFileSize } from "../finder/damFinderItems";
import type { DamFileDetails } from "./EditFile";

interface FileInfosProps {
    file: DamFileDetails;
}

/** The facts of a file that can't be edited: type, size, dimensions, path, and when it was uploaded and changed. */
export function FileInfos({ file }: FileInfosProps) {
    const intl = useIntl();
    const items: KeyValueListItem[] = [
        {
            key: intl.formatMessage({ id: "dextinity.dam.file.format", defaultMessage: "Format" }),
            value: file.mimetype,
        },
        {
            key: intl.formatMessage({ id: "dextinity.dam.file.fileSize", defaultMessage: "File Size" }),
            value: formatFileSize(intl, file.size),
        },
        ...(file.image != null
            ? [
                  {
                      key: intl.formatMessage({ id: "dextinity.dam.file.widthAndHeight", defaultMessage: "Width and Height" }),
                      value: intl.formatMessage(
                          { id: "dextinity.dam.file.widthAndHeightValue", defaultMessage: "{width} x {height} px" },
                          { width: file.image.width, height: file.image.height },
                      ),
                  },
              ]
            : []),
        {
            key: intl.formatMessage({ id: "dextinity.dam.file.folder", defaultMessage: "Folder" }),
            value: file.folder != null ? file.damPath : intl.formatMessage({ id: "dextinity.dam.file.rootFolder", defaultMessage: "Top level" }),
        },
        {
            key: intl.formatMessage({ id: "dextinity.dam.file.createdAt", defaultMessage: "Uploaded" }),
            value: <FormattedDate value={file.createdAt} dateStyle="medium" timeStyle="short" />,
        },
        {
            key: intl.formatMessage({ id: "dextinity.dam.file.updatedAt", defaultMessage: "Last changed" }),
            value: <FormattedDate value={file.updatedAt} dateStyle="medium" timeStyle="short" />,
        },
    ];

    return <KeyValueList items={items} />;
}

interface EmbeddedMetadataProps {
    exif: Record<string, unknown>;
}

/** The metadata embedded in an image file, e.g. EXIF of a photo. */
export function EmbeddedMetadata({ exif }: EmbeddedMetadataProps) {
    const items = Object.entries(exif).map(([key, value]) => ({ key, value: <EmbeddedMetadataValue value={value} /> }));
    return <KeyValueList items={items} />;
}

function EmbeddedMetadataValue({ value }: { value: unknown }) {
    if (typeof value === "object") {
        return <>{JSON.stringify(value)}</>;
    }
    if (typeof value === "string" && isDateString(value)) {
        return <FormattedDate value={value} dateStyle="medium" timeStyle="short" />;
    }
    return <>{String(value)}</>;
}
