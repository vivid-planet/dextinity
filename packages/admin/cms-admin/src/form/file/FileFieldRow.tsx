import { AssetThumbnail, Icon, IconButton } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";

import { getDamFinderAssetType, getFileExtension } from "../../dam/finder/damFinderItems";
import { DamPathLazy } from "./DamPathLazy";
import type { GQLDamFileFieldFileFragment } from "./FileField.fragment.generated";
import { FileFieldMenu, type FileFieldMenuActions, useHasFileFieldMenu } from "./FileFieldMenu";

interface FileFieldRowProps {
    file: GQLDamFileFieldFileFragment;
    /** Shows a remove button; for a field that holds several files. */
    onRemove?: () => void;
    preview?: ReactNode;
    menuActions?: FileFieldMenuActions;
}

export const FileFieldRow = ({ file, onRemove, preview, menuActions }: FileFieldRowProps) => {
    const intl = useIntl();
    const showsMenu = useHasFileFieldMenu(menuActions);

    return (
        <Root>
            <Preview>{preview ?? <FileFieldThumbnail file={file} />}</Preview>
            <Text>
                <Name>{file.name}</Name>
                <Path>
                    <DamPathLazy fileId={file.id} />
                </Path>
            </Text>
            {(onRemove != null || showsMenu) && (
                <Actions>
                    {onRemove != null && (
                        <IconButton
                            variant="text"
                            color="secondary"
                            size="small"
                            onClick={onRemove}
                            aria-label={intl.formatMessage({ id: "dextinity.form.file.removeFile", defaultMessage: "Remove" })}
                        >
                            <Icon name="trash" />
                        </IconButton>
                    )}
                    {showsMenu && <FileFieldMenu fileId={file.id} menuActions={menuActions} />}
                </Actions>
            )}
        </Root>
    );
};

function FileFieldThumbnail({ file }: { file: GQLDamFileFieldFileFragment }) {
    return (
        <AssetThumbnail
            type={getDamFinderAssetType(file.mimetype)}
            ratio="1:1"
            src={file.image?.thumbnailUrl ?? (file.mimetype === "image/svg+xml" ? file.fileUrl : undefined)}
            fileType={getFileExtension(file.name) ?? undefined}
        />
    );
}

const Root = styled("div")`
    display: flex;
    align-items: center;
    gap: var(--dextinity-space-3);
    padding: var(--dextinity-space-3) var(--dextinity-space-4);

    & + & {
        border-block-start: 1px solid var(--dextinity-color-line);
    }
`;

const Preview = styled("div")`
    display: grid;
    flex: none;
    place-items: center;
    overflow: hidden;
    inline-size: 64px;
    block-size: 64px;
    border-radius: var(--dextinity-radius-item);
    background: var(--dextinity-color-surface-sunken);
    color: var(--dextinity-color-text-subtle);

    > [data-type] {
        inline-size: 100%;
    }

    > img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
    }
`;

const Text = styled("div")`
    display: grid;
    flex: 1;
    gap: var(--dextinity-space-1);
    min-inline-size: 0;
`;

const Name = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text);
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Path = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text-subtle);
    font-size: var(--dextinity-typography-small-size);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Actions = styled("div")`
    display: flex;
    flex: none;
    gap: var(--dextinity-space-1);
`;
