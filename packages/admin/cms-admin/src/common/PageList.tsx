import { messages } from "@dextinity/admin";
import { ArrowLeft, File, Folder } from "@dextinity/admin-icons";
import { List, ListItem, ListItemButton, ListItemIcon } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { JSX } from "react";
import { FormattedMessage } from "react-intl";

export interface PageListItem {
    id: string;
    name: string;
    path: string;
    type: "folder" | "page";
    selected?: boolean;
}

interface PageListProps {
    items: PageListItem[];
    showBackButton: boolean;
    onItemClick: (item: PageListItem) => void;
    onBackClick: () => void;
    siteUrl: string;
}

export function PageList({ items, showBackButton, onItemClick, onBackClick, siteUrl }: PageListProps): JSX.Element {
    return (
        <Root>
            {showBackButton && (
                <ListItemButton divider onClick={onBackClick}>
                    <ListItemIcon>
                        <ArrowLeft />
                    </ListItemIcon>
                    <FormattedMessage {...messages.back} />
                </ListItemButton>
            )}
            <ScrollableListSection>
                {items.map((item) => (
                    <ListItemButton
                        key={`${item.id}-${item.type}`}
                        onClick={() => onItemClick?.(item)}
                        selected={item.selected}
                        title={item.type === "page" ? `${siteUrl}${item.path}` : undefined}
                    >
                        <ListItemIcon>{item.type === "page" ? <File /> : <Folder />}</ListItemIcon>
                        {item.name}
                    </ListItemButton>
                ))}
                {items.length === 0 && (
                    <ListItem>
                        <FormattedMessage id="dextinity.pages.pageList.noItems" defaultMessage="No items" />
                    </ListItem>
                )}
            </ScrollableListSection>
        </Root>
    );
}

const Root = styled(List)`
    width: 300px;
    padding: 0;
`;

const ScrollableListSection = styled("div")`
    max-height: 240px;
    overflow-y: auto;
`;
