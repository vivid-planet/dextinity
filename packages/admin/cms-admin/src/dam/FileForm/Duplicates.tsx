import { gql, useQuery } from "@apollo/client";
import { Alert, Button, FormSection, useStackApi } from "@dextinity/admin";
import { BallTriangle as BallTriangleIcon, Link as LinkIcon, OpenNewTab as OpenNewTabIcon, Reload as ReloadIcon } from "@dextinity/admin-icons";
import { IconButton, List as MuiList, ListItem, ListItemIcon as MuiListItemIcon, ListItemSecondaryAction, ListItemText } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import type { GQLDamFileDuplicatesQuery, GQLDamFileDuplicatesQueryVariables } from "./Duplicates.generated";

const damFileDuplicatesQuery = gql`
    query DamFileDuplicates($id: ID!) {
        damFile(id: $id) {
            duplicates {
                id
                name
                folder {
                    id
                    name
                    parents {
                        id
                        name
                    }
                }
            }
        }
    }
`;

const Duplicates = ({ fileId }: { fileId: string }) => {
    const stackApi = useStackApi();
    const { data, loading, refetch } = useQuery<GQLDamFileDuplicatesQuery, GQLDamFileDuplicatesQueryVariables>(damFileDuplicatesQuery, {
        variables: {
            id: fileId,
        },
        notifyOnNetworkStatusChange: true,
    });

    return (
        <FormSection
            title={
                <FormattedMessage
                    id="dextinity.dam.file.duplicates.title"
                    defaultMessage="{count, plural, =0 {No files found} one {# file} other {# files}}"
                    values={{ count: data?.damFile.duplicates.length || 0 }}
                />
            }
        >
            <List disablePadding>
                <ListItemHeader key="refresh" divider>
                    <Button size="small" variant="textDark" endIcon={<ReloadIcon />} onClick={() => refetch({ id: fileId })}>
                        <FormattedMessage id="dextinity.dam.file.duplicates.refresh" defaultMessage="Refresh" />
                    </Button>
                </ListItemHeader>
                {data?.damFile.duplicates.map((file) => {
                    const folderPath = [],
                        urlPath = [];
                    if (file.folder) {
                        file.folder.parents.forEach((folder) => {
                            urlPath.push(folder.id, "folder");
                            folderPath.push(folder.name);
                        });
                        urlPath.push(file.folder.id, "folder");
                        folderPath.push(file.folder.name);
                    }
                    const href = `${stackApi?.breadCrumbs[0].url || ""}/${[...urlPath, file.id, "edit"].join("/")}`;

                    return (
                        <ListItem key={file.id} divider>
                            <ListItemTextWrapper>
                                <ListItemText primary={file.name} secondary={`/${folderPath.join("/")}`} />
                            </ListItemTextWrapper>
                            <ListItemSecondaryAction>
                                <IconButton href={href} size="large">
                                    <LinkIcon />
                                </IconButton>
                                <IconButton href={href} target="_blank" size="large">
                                    <OpenNewTabIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    );
                })}
                {loading && (
                    <ListItem key="loading" divider>
                        <ListItemIcon>
                            <LoadingIcon />
                        </ListItemIcon>
                    </ListItem>
                )}
            </List>
            <Alert
                title={<FormattedMessage id="dextinity.dam.file.duplicates.info.title" defaultMessage="What are duplicate assets?" />}
                sx={{ marginTop: 4 }}
            >
                <FormattedMessage
                    id="dextinity.dam.file.duplicates.info.content"
                    defaultMessage="Duplicates refer to one or more identical copies of a digital asset stored in the DAM system. The DAM automatically detects identical assets, even if their file names are different, to reduce storage usage."
                />
            </Alert>
        </FormSection>
    );
};

export default Duplicates;

const List = styled(MuiList)`
    background-color: ${({ theme }) => theme.palette.background.paper};
`;

const ListItemHeader = styled(ListItem)`
    display: flex;
    justify-content: flex-end;
`;

const ListItemTextWrapper = styled("div")`
    padding-right: 48px;
`;

const ListItemIcon = styled(MuiListItemIcon)`
    display: flex;
    justify-content: center;
`;

const LoadingIcon = styled(BallTriangleIcon)`
    font-size: 32px;
    margin: ${({ theme }) => theme.spacing(2, 0)};
`;
