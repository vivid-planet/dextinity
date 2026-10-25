import { Field, FinalFormSelect } from "@dextinity/admin";
import { BlockAdminComponentPaper, BlockCategory, type BlockInterface, BlocksFinalForm, createBlockSkeleton } from "@dextinity/cms-admin";
import { Divider, MenuItem } from "@mui/material";
import { FormattedMessage } from "react-intl";

import { type DamBlockFile, damBlockFilePreview, loadDamBlockFile } from "./damBlockFile.js";
import { DamFileField } from "./DamFileField.js";

type OpenFileType = "NewTab" | "Download";

export interface DamFileDownloadLinkBlockState {
    file?: DamBlockFile;
    openFileType: OpenFileType;
}

export interface DamFileDownloadLinkBlockOutput {
    fileId?: string;
    openFileType: OpenFileType;
}

/** The DAM file download link of `@dextinity/cms-admin` with the DAM's REST API */
export const DamFileDownloadLinkBlock: BlockInterface<DamFileDownloadLinkBlockOutput, DamFileDownloadLinkBlockState, DamFileDownloadLinkBlockOutput> =
    {
        ...createBlockSkeleton(),

        name: "DamFileDownloadLink",

        displayName: <FormattedMessage id="dextinity.blocks.damFileDownloadLink" defaultMessage="CMS Asset" />,

        category: BlockCategory.Media,

        defaultValues: () => ({ openFileType: "Download" }),

        state2Output: ({ file, openFileType }) => ({ fileId: file?.id, openFileType }),

        output2State: async ({ fileId, openFileType }, { apiUrl }) => ({
            file: fileId ? await loadDamBlockFile(apiUrl, fileId) : undefined,
            openFileType,
        }),

        createPreviewState: ({ file, openFileType }, { apiUrl, parentUrl }) => ({
            file: file && damBlockFilePreview(file, apiUrl),
            openFileType,
            adminMeta: { route: parentUrl },
        }),

        previewContent: ({ file }) => (file ? [{ type: "text", content: file.name }] : []),

        definesOwnPadding: true,

        AdminComponent: ({ state, updateState }) => (
            <BlocksFinalForm<DamFileDownloadLinkBlockState>
                onSubmit={({ file, openFileType }) => updateState({ file, openFileType })}
                initialValues={{ file: state.file, openFileType: state.openFileType }}
            >
                <Field name="file" component={DamFileField} fullWidth />
                <Divider />
                <BlockAdminComponentPaper>
                    <Field
                        name="openFileType"
                        fullWidth
                        label={<FormattedMessage id="dextinity.blocks.damFileDownloadLink.openFileType" defaultMessage="Open file" />}
                    >
                        {(props) => (
                            <FinalFormSelect {...props}>
                                <MenuItem value="Download">
                                    <FormattedMessage
                                        id="dextinity.blocks.damFileDownloadLink.openFileType.download"
                                        defaultMessage="as a download"
                                    />
                                </MenuItem>
                                <MenuItem value="NewTab">
                                    <FormattedMessage id="dextinity.blocks.damFileDownloadLink.openFileType.newTab" defaultMessage="in a new tab" />
                                </MenuItem>
                            </FinalFormSelect>
                        )}
                    </Field>
                </BlockAdminComponentPaper>
            </BlocksFinalForm>
        ),
    };
