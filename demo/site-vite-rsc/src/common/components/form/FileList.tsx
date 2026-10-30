import { SvgUse } from "@src/common/helpers/SvgUse";
import clsx from "clsx";
import { useIntl } from "react-intl";

import styles from "./FileList.module.scss";
import type { FileUpload } from "./FileUploadField";

type FileListProps = {
    fileUploads: FileUpload[];
    onRemove: (key: string) => void;
};

export const FileList = ({ fileUploads, onRemove }: FileListProps) => {
    const intl = useIntl();

    return (
        <ul className={styles.fileList}>
            {fileUploads.map((fileUpload) => (
                <li key={fileUpload.key} className={clsx(styles.fileItem, fileUpload.status === "error" && styles["fileItem--error"])}>
                    <SvgUse
                        href={`/assets/icons/${fileUpload.status === "error" ? "file-error" : "file"}.svg#root`}
                        width={16}
                        height={16}
                        className={styles.fileIcon}
                    />
                    <span className={styles.fileName} title={fileUpload.errorMessage ?? fileUpload.file.name}>
                        {fileUpload.file.name}
                    </span>
                    <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => onRemove(fileUpload.key)}
                        aria-label={intl.formatMessage(
                            { id: "fileUploadField.removeFile", defaultMessage: "Remove {fileName}" },
                            { fileName: fileUpload.file.name },
                        )}
                    >
                        <SvgUse href="/assets/icons/delete.svg#root" width={16} height={16} />
                    </button>
                </li>
            ))}
        </ul>
    );
};
