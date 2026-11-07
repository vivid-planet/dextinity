import { useApolloClient } from "@apollo/client";
import { Button, Icon } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type ReactElement, type ReactNode, useState } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage, useIntl } from "react-intl";

import { BlockAdminComponentButton } from "../../blocks/common/BlockAdminComponentButton";
import { BlockAdminComponentPaper } from "../../blocks/common/BlockAdminComponentPaper";
import { useDamScopeFromContentScope } from "../../dam/config/useDamScope";
import { DamFilePickerDialog } from "./chooseFile/DamFilePickerDialog";
import { getDamFileFolderId } from "./DamFileField";
import type { GQLDamFileFieldFileFragment } from "./FileField.fragment.generated";
import { damFileFieldFileQuery, damFileFieldFilesByIdsQuery } from "./FileField.gql";
import type {
    GQLDamFileFieldFileQuery,
    GQLDamFileFieldFileQueryVariables,
    GQLDamFileFieldFilesByIdsQuery,
    GQLDamFileFieldFilesByIdsQueryVariables,
} from "./FileField.gql.generated";
import type { FileFieldMenuActions } from "./FileFieldMenu";
import { FileFieldRow } from "./FileFieldRow";

export type { GQLDamFileFieldFileFragment } from "./FileField.fragment.generated";

type CommonProps = {
    buttonText?: ReactNode;
    allowedMimetypes?: string[];
    /** Entries of the file's menu besides "Open in DAM": `MenuItem` props or `MenuItem` elements from `@dextinity/ui`. */
    menuActions?: FileFieldMenuActions;
};

type SingleFileFieldProps = FieldRenderProps<GQLDamFileFieldFileFragment | undefined, HTMLInputElement> &
    CommonProps & {
        multiple?: false;
        preview?: ReactNode;
    };

type MultiFileFieldProps = FieldRenderProps<GQLDamFileFieldFileFragment[] | undefined, HTMLInputElement> &
    CommonProps & {
        multiple: true;
        preview?: (file: GQLDamFileFieldFileFragment) => ReactNode;
    };

/**
 * A React Final Form `Field` component to choose a file from the assets in a block, shown as a card with the file's preview, name and
 * path. Its value is the file (`GQLDamFileFieldFileFragment`) or `undefined`; with `multiple`, a list of files.
 *
 * In forms built with `@dextinity/ui-react-final-form`, use `DamFileField` instead.
 */
export function FileField(props: SingleFileFieldProps): ReactElement;
export function FileField(props: MultiFileFieldProps): ReactElement;
export function FileField(props: SingleFileFieldProps | MultiFileFieldProps): ReactElement {
    // `react-final-form`'s `<Field>` strips `multiple` from the component's top-level props
    // and puts it on `input.multiple`, so we have to check both locations.
    const isMultiple = Boolean(props.multiple) || Boolean(props.input?.multiple);
    if (isMultiple) {
        return <MultiFileField {...(props as MultiFileFieldProps)} />;
    }
    return <SingleFileField {...(props as SingleFileFieldProps)} />;
}

const SingleFileField = ({ buttonText, input, allowedMimetypes, preview, menuActions }: SingleFileFieldProps) => {
    const intl = useIntl();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [loadError, setLoadError] = useState<string>();
    const apolloClient = useApolloClient();

    const damFile = input.value || undefined;

    const chooseFile = async ([fileId]: string[]) => {
        try {
            const { data } = await apolloClient.query<GQLDamFileFieldFileQuery, GQLDamFileFieldFileQueryVariables>({
                query: damFileFieldFileQuery,
                variables: { id: fileId },
            });
            setLoadError(undefined);
            input.onChange(data.damFile);
        } catch {
            setLoadError(
                intl.formatMessage({
                    id: "dextinity.form.file.failedToLoadSelectedFile",
                    defaultMessage: "Failed to load the selected file. Please try again.",
                }),
            );
        }
        setPickerOpen(false);
    };

    return (
        <>
            {damFile ? (
                <BlockAdminComponentPaper disablePadding>
                    <FileFieldRow file={damFile} preview={preview} menuActions={menuActions} />
                    <Footer>
                        <Button variant="text" color="secondary" startIcon={<Icon name="assets" />} onClick={() => setPickerOpen(true)}>
                            <FormattedMessage id="dextinity.form.file.replaceFile" defaultMessage="Replace" />
                        </Button>
                        <Button variant="text" color="secondary" startIcon={<Icon name="delete" />} onClick={() => input.onChange(undefined)}>
                            <FormattedMessage id="dextinity.form.file.empty" defaultMessage="Empty" />
                        </Button>
                    </Footer>
                </BlockAdminComponentPaper>
            ) : (
                <BlockAdminComponentButton onClick={() => setPickerOpen(true)} startIcon={<Icon name="assets" />} size="large">
                    {buttonText ?? <FormattedMessage id="dextinity.form.file.chooseFile" defaultMessage="Choose file" />}
                </BlockAdminComponentButton>
            )}
            {loadError != null && <ErrorMessage role="alert">{loadError}</ErrorMessage>}
            <DamFilePickerDialog
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onChoose={chooseFile}
                initialFileIds={damFile ? [damFile.id] : []}
                initialFolderId={getDamFileFolderId(damFile)}
                allowedMimetypes={allowedMimetypes}
            />
        </>
    );
};

const MultiFileField = ({ buttonText, input, allowedMimetypes, preview, menuActions }: MultiFileFieldProps) => {
    const intl = useIntl();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [loadError, setLoadError] = useState<string>();
    const apolloClient = useApolloClient();
    const damScope = useDamScopeFromContentScope();

    // react-final-form may pass "" as the default when no initial value is set; fall back to [].
    const files: GQLDamFileFieldFileFragment[] = Array.isArray(input.value) ? input.value : [];

    const chooseFiles = async (fileIds: string[]) => {
        try {
            const { data } = await apolloClient.query<GQLDamFileFieldFilesByIdsQuery, GQLDamFileFieldFilesByIdsQueryVariables>({
                query: damFileFieldFilesByIdsQuery,
                variables: { ids: fileIds, limit: fileIds.length, scope: damScope },
            });
            setLoadError(undefined);
            input.onChange([...data.damFilesList.nodes].sort((first, second) => fileIds.indexOf(first.id) - fileIds.indexOf(second.id)));
        } catch {
            setLoadError(
                intl.formatMessage({
                    id: "dextinity.form.file.failedToLoadSelection",
                    defaultMessage: "Failed to load selected files. Please try again.",
                }),
            );
        }
        setPickerOpen(false);
    };

    return (
        <>
            {files.length === 0 ? (
                <BlockAdminComponentButton onClick={() => setPickerOpen(true)} startIcon={<Icon name="assets" />} size="large">
                    {buttonText ?? <FormattedMessage id="dextinity.form.file.chooseFiles" defaultMessage="Choose files" />}
                </BlockAdminComponentButton>
            ) : (
                <BlockAdminComponentPaper disablePadding>
                    {files.map((file) => (
                        <FileFieldRow
                            key={file.id}
                            file={file}
                            onRemove={() => input.onChange(files.filter(({ id }) => id !== file.id))}
                            preview={preview?.(file)}
                            menuActions={menuActions}
                        />
                    ))}
                    <Footer>
                        <Button variant="text" color="secondary" startIcon={<Icon name="assets" />} onClick={() => setPickerOpen(true)}>
                            <FormattedMessage id="dextinity.form.file.changeSelectedFiles" defaultMessage="Change selected files" />
                        </Button>
                    </Footer>
                </BlockAdminComponentPaper>
            )}
            {loadError != null && <ErrorMessage role="alert">{loadError}</ErrorMessage>}
            <DamFilePickerDialog
                open={pickerOpen}
                multiple
                onClose={() => setPickerOpen(false)}
                onChoose={chooseFiles}
                initialFileIds={files.map(({ id }) => id)}
                initialFolderId={getDamFileFolderId(files[0])}
                allowedMimetypes={allowedMimetypes}
            />
        </>
    );
};

const Footer = styled("div")`
    display: flex;
    border-block-start: 1px solid var(--dextinity-color-line);

    > * {
        flex: 1;
    }

    > * + * {
        border-inline-start: 1px solid var(--dextinity-color-line);
        border-radius: 0;
    }
`;

const ErrorMessage = styled("p")`
    margin: var(--dextinity-space-2) 0 0;
    color: var(--dextinity-color-danger-text);
    font-size: var(--dextinity-typography-small-size);
`;
