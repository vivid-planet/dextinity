import { useApolloClient } from "@apollo/client";
import { AssetThumbnail, Icon } from "@dextinity/ui";
import { PickerField, type PickerFieldProps } from "@dextinity/ui-react-final-form";
import { styled } from "@mui/material/styles";
import { type ReactNode, useState } from "react";
import { type IntlShape, useIntl } from "react-intl";

import { useDamScopeFromContentScope } from "../../dam/config/useDamScope";
import { formatFileSize, getDamFinderAssetType, getFileExtension } from "../../dam/finder/damFinderItems";
import { DamFilePickerDialog } from "./chooseFile/DamFilePickerDialog";
import { damFileFieldValueQuery, damFileFieldValuesQuery } from "./DamFileField.gql";
import type {
    GQLDamFileFieldValueQuery,
    GQLDamFileFieldValueQueryVariables,
    GQLDamFileFieldValuesQuery,
    GQLDamFileFieldValuesQueryVariables,
} from "./DamFileField.gql.generated";
import type { GQLDamFileFieldFileFragment } from "./FileField.fragment.generated";

type DamFile = GQLDamFileFieldFileFragment;

interface CommonProps {
    /** Offers only files of these MIME types in the picker. */
    allowedMimetypes?: string[];
}

export type SingleDamFileFieldProps<FieldValue = DamFile | null> = Omit<PickerFieldProps<DamFile, FieldValue>, "renderValue" | "renderPicker"> &
    CommonProps & {
        multiple?: false;
    };

export type MultipleDamFileFieldProps<FieldValue = DamFile[] | null> = Omit<PickerFieldProps<DamFile[], FieldValue>, "renderValue" | "renderPicker"> &
    CommonProps & {
        /** Lets several files be chosen; the value is then a list, empty for none. */
        multiple: true;
    };

export type DamFileFieldProps = SingleDamFileFieldProps | MultipleDamFileFieldProps;

const maxThumbnailsInValue = 3;

function FileThumbnail({ file }: { file: DamFile }) {
    const type = getDamFinderAssetType(file.mimetype);
    if (type === "document") {
        return (
            <ThumbnailFrame>
                <Icon name="file" />
            </ThumbnailFrame>
        );
    }
    return (
        <Thumbnail type={type} ratio="1:1" src={file.image?.thumbnailUrl ?? (file.mimetype === "image/svg+xml" ? file.fileUrl : undefined)} alt="" />
    );
}

/** The folder of a file whose value was loaded with its folder, `null` for the root; `undefined` lets the picker look it up. */
export function getDamFileFolderId(file: Pick<DamFile, "folder"> | null | undefined): string | null | undefined {
    if (file == null || file.folder === undefined) {
        return undefined;
    }
    return file.folder?.id ?? null;
}

function renderFileMeta(intl: IntlShape, file: DamFile) {
    return [getFileExtension(file.name), formatFileSize(intl, file.size)].filter((part) => part != null).join(" · ");
}

/**
 * A React Final Form field to choose a file from the assets, built with `@dextinity/ui`: it shows the file's thumbnail and name and opens
 * the `DamFilePickerDialog`, where files can also be uploaded. Its value is the file (`GQLDamFileFieldFileFragment`) or `null`; with
 * `multiple`, a list of files.
 */
export function DamFileField(props: DamFileFieldProps): ReactNode {
    return props.multiple ? <MultipleDamFileField {...props} /> : <SingleDamFileField {...props} />;
}

function SingleDamFileField({ allowedMimetypes, placeholder, labels, multiple: _multiple, ...props }: SingleDamFileFieldProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const [loadError, setLoadError] = useState<string>();

    return (
        <PickerField<DamFile, DamFile | null>
            {...props}
            helperText={loadError ?? props.helperText}
            placeholder={placeholder ?? intl.formatMessage({ id: "dextinity.form.file.chooseFile", defaultMessage: "Choose file" })}
            labels={{ clear: intl.formatMessage({ id: "dextinity.form.file.empty", defaultMessage: "Empty" }), ...labels }}
            icon={<Icon name="images" />}
            renderValue={(file) => (
                <>
                    <FileThumbnail file={file} />
                    <FileName>{file.name}</FileName>
                    <FileMeta>{renderFileMeta(intl, file)}</FileMeta>
                </>
            )}
            renderPicker={({ open, value, onChange, onClose }) => (
                <DamFilePickerDialog
                    open={open}
                    onClose={onClose}
                    initialFileIds={value != null ? [value.id] : []}
                    initialFolderId={getDamFileFolderId(value)}
                    allowedMimetypes={allowedMimetypes}
                    onChoose={async ([fileId]) => {
                        try {
                            const { data } = await client.query<GQLDamFileFieldValueQuery, GQLDamFileFieldValueQueryVariables>({
                                query: damFileFieldValueQuery,
                                variables: { id: fileId },
                            });
                            setLoadError(undefined);
                            onChange(data.damFile);
                        } catch {
                            setLoadError(
                                intl.formatMessage({
                                    id: "dextinity.form.file.failedToLoadSelectedFile",
                                    defaultMessage: "Failed to load the selected file. Please try again.",
                                }),
                            );
                            onClose();
                        }
                    }}
                />
            )}
        />
    );
}

function MultipleDamFileField({ allowedMimetypes, placeholder, labels, multiple: _multiple, ...props }: MultipleDamFileFieldProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const damScope = useDamScopeFromContentScope();
    const [loadError, setLoadError] = useState<string>();

    return (
        <PickerField<DamFile[], DamFile[] | null>
            {...props}
            helperText={loadError ?? props.helperText}
            placeholder={placeholder ?? intl.formatMessage({ id: "dextinity.form.file.chooseFiles", defaultMessage: "Choose files" })}
            labels={{ clear: intl.formatMessage({ id: "dextinity.form.file.empty", defaultMessage: "Empty" }), ...labels }}
            icon={<Icon name="images" />}
            renderValue={(files) => (
                <>
                    {files.slice(0, maxThumbnailsInValue).map((file) => (
                        <FileThumbnail key={file.id} file={file} />
                    ))}
                    <FileName>
                        {files.length === 1
                            ? files[0].name
                            : intl.formatMessage(
                                  { id: "dextinity.form.file.fileCount", defaultMessage: "{count, plural, one {# file} other {# files}}" },
                                  { count: files.length },
                              )}
                    </FileName>
                    {files.length > 1 && <FileMeta>{files.map((file) => file.name).join(", ")}</FileMeta>}
                </>
            )}
            renderPicker={({ open, value, onChange, onClose }) => (
                <DamFilePickerDialog
                    open={open}
                    multiple
                    onClose={onClose}
                    initialFileIds={(value ?? []).map((file) => file.id)}
                    initialFolderId={getDamFileFolderId(value?.[0])}
                    allowedMimetypes={allowedMimetypes}
                    onChoose={async (fileIds) => {
                        try {
                            const { data } = await client.query<GQLDamFileFieldValuesQuery, GQLDamFileFieldValuesQueryVariables>({
                                query: damFileFieldValuesQuery,
                                variables: { ids: fileIds, limit: fileIds.length, scope: damScope },
                            });
                            setLoadError(undefined);
                            onChange([...data.damFilesList.nodes].sort((first, second) => fileIds.indexOf(first.id) - fileIds.indexOf(second.id)));
                        } catch {
                            setLoadError(
                                intl.formatMessage({
                                    id: "dextinity.form.file.failedToLoadSelection",
                                    defaultMessage: "Failed to load selected files. Please try again.",
                                }),
                            );
                            onClose();
                        }
                    }}
                />
            )}
        />
    );
}

const Thumbnail = styled(AssetThumbnail)`
    flex: none;
    inline-size: 24px;
`;

const ThumbnailFrame = styled("span")`
    display: inline-grid;
    flex: none;
    place-items: center;
    inline-size: 24px;
    block-size: 24px;
    border-radius: 4px;
    background: var(--dextinity-color-surface-sunken);
    color: var(--dextinity-color-text-subtle);
`;

const FileName = styled("span")`
    overflow: hidden;
    text-overflow: ellipsis;
`;

const FileMeta = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text-subtle);
    font-size: var(--dextinity-typography-small-size);
    text-overflow: ellipsis;
`;
