import { ArrowRight, BallTriangle, PageTree, TreeCollapse, TreeExpand } from "@dextinity/admin-icons";
import { ListItem, type SvgIconProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { type CSSProperties, type ForwardRefExoticComponent, type ReactNode, type RefAttributes, useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";
import AutoSizer, { type Size } from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

import { MarkedMatches } from "../../common/MarkedMatches";
import type { FolderTreeMap } from "./useFolderTree";
import type { FolderWithMatches } from "./useFolderTreeSearch";

export { allFoldersQuery } from "./ChooseFolder.gql";
export type { GQLAllFoldersWithoutFiltersQuery, GQLAllFoldersWithoutFiltersQueryVariables } from "./ChooseFolder.gql.generated";

interface ChooseFolderProps {
    folderTree: FolderTreeMap;
    foldersToRenderWithMatches: Array<FolderWithMatches>;
    loading: boolean;
    toggleExpand: (id: string) => void;
    selectedId?: string | null;
    onFolderClick: (id: string | null) => void;
    focusedFolderId?: string;
}

export const ChooseFolder = ({
    folderTree,
    foldersToRenderWithMatches,
    loading,
    toggleExpand,
    selectedId,
    onFolderClick,
    focusedFolderId,
}: ChooseFolderProps) => {
    useEffect(() => {
        if (focusedFolderId === undefined) {
            return;
        }

        const index = foldersToRenderWithMatches.findIndex((folder) => folder.id === focusedFolderId) + 1; // + 1 is necessary because we artificially add the "Asset Manager" as the first item

        refList.current?.scrollToItem(index, "smart");

        // This should only be executed if the focusedFolderId changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusedFolderId]);

    const refList = useRef<List>(null);

    return (
        <AutoSizer>
            {({ height, width }: Size) => {
                return (
                    <List
                        ref={refList}
                        height={height}
                        width={width}
                        itemCount={foldersToRenderWithMatches.length + 1}
                        itemSize={56}
                        overscanCount={1} // do not increase this for performance reasons
                        style={{ scrollBehavior: "smooth" }}
                    >
                        {({ index, style }) => {
                            if (loading) {
                                return (
                                    <StyledListItem offset={20 + 36} style={style}>
                                        <div>
                                            <BallTriangle sx={{ marginRight: "20px" }} />
                                            <FormattedMessage id="dextinity.dam.moveDamItemDialog.loading" defaultMessage="Loading ..." />
                                        </div>
                                    </StyledListItem>
                                );
                            }

                            if (index === 0) {
                                return (
                                    <ChooseFolderItem
                                        Icon={PageTree}
                                        message={<FormattedMessage id="dextinity.pages.dam.assetManager" defaultMessage="Asset Manager" />}
                                        offset={20}
                                        isChosen={selectedId === null}
                                        onClick={() => {
                                            onFolderClick(null);
                                        }}
                                        style={style}
                                    />
                                );
                            }

                            const folder = foldersToRenderWithMatches[index - 1];

                            return (
                                <ChooseFolderItem
                                    key={folder.id}
                                    Icon={folderTree.has(folder.id) ? (folder.expanded ? TreeCollapse : TreeExpand) : undefined}
                                    onIconClick={() => {
                                        toggleExpand(folder.id);
                                    }}
                                    message={folder.matches ? <MarkedMatches text={folder.name} matches={folder.matches} /> : folder.name}
                                    offset={20 + 36 * folder.level}
                                    isChosen={selectedId === folder.id}
                                    onClick={() => {
                                        onFolderClick(folder.id);
                                    }}
                                    style={style}
                                />
                            );
                        }}
                    </List>
                );
            }}
        </AutoSizer>
    );
};

const StyledListItem = styled(ListItem)<{ offset: number; isChosen?: boolean }>`
    display: flex;
    justify-content: space-between;

    height: 56px;
    background: white;
    cursor: pointer;
    padding-left: ${({ offset }) => offset}px;

    border-left: solid 2px transparent;
    border-right: solid 2px transparent;
    border-bottom: solid 1px ${({ theme }) => theme.palette.grey[100]};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        border-left: solid 2px ${({ theme }) => theme.palette.primary.main};
        border-right: solid 2px ${({ theme }) => theme.palette.primary.main};
        background: ${({ theme }) => theme.palette.grey[50]};
    }

    ${({ isChosen, theme }) => {
        return isChosen
            ? `
                border: solid 2px ${theme.palette.primary.main};
                
                &:last-child {
                    border-bottom: solid 2px ${theme.palette.primary.main};
                }
            `
            : null;
    }}
`;

interface ChooseFolderItemProps {
    Icon?: ForwardRefExoticComponent<Omit<SvgIconProps, "ref"> & RefAttributes<SVGSVGElement>>;
    onIconClick?: () => void;
    onClick?: () => void;
    message: ReactNode;
    offset: number;
    isChosen?: boolean;
    style: CSSProperties;
}
const ChooseFolderItem = ({ Icon, onIconClick, onClick, message, offset, isChosen = false, style }: ChooseFolderItemProps) => {
    return (
        <StyledListItem style={style} offset={Icon ? offset : offset + 20 + 16} isChosen={isChosen} onClick={onClick}>
            <div>
                {Icon && (
                    <Icon
                        sx={{ marginRight: "20px" }}
                        onClick={(event) => {
                            event.stopPropagation();
                            onIconClick?.();
                        }}
                    />
                )}
                {message}
            </div>
            <ArrowRight />
        </StyledListItem>
    );
};
