import { gql, useQuery } from "@apollo/client";
import { Banner, DataGrid, type DataGridColumn, EmptyState, Icon, IconButton } from "@dextinity/ui";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import { useDataGridLabels } from "../../dataGrid/remoteList/useDataGridLabels";
import type { GQLDamFileDuplicatesQuery, GQLDamFileDuplicatesQueryVariables } from "./Duplicates.generated";
import { DuplicatesRoot, DuplicatesToolbar, InfoTitle, Name, NameCell, SecondaryText } from "./Duplicates.sc";

const damFileDuplicatesQuery = gql`
    query DamFileDuplicates($id: ID!) {
        damFile(id: $id) {
            id
            duplicates {
                id
                name
                damPath
            }
        }
    }
`;

type Duplicate = GQLDamFileDuplicatesQuery["damFile"]["duplicates"][number];

interface DuplicatesProps {
    fileId: string;
    getEditUrl: (fileId: string) => string;
}

/** The files with the same content as the file, which the DAM detects regardless of their names. */
export function Duplicates({ fileId, getEditUrl }: DuplicatesProps) {
    const intl = useIntl();
    const history = useHistory();
    const { labels: dataGridLabels } = useDataGridLabels();
    const { data, loading, error, refetch } = useQuery<GQLDamFileDuplicatesQuery, GQLDamFileDuplicatesQueryVariables>(damFileDuplicatesQuery, {
        variables: { id: fileId },
        notifyOnNetworkStatusChange: true,
    });

    if (error) {
        throw error;
    }

    const duplicates = data?.damFile.duplicates ?? [];
    const columns: DataGridColumn<Duplicate>[] = [
        {
            key: "name",
            header: intl.formatMessage({ id: "dextinity.dam.file.duplicates.file", defaultMessage: "File" }),
            render: (duplicate) => (
                <NameCell>
                    <Name>{duplicate.name}</Name>
                    {duplicate.damPath !== "/" && <SecondaryText>{duplicate.damPath}</SecondaryText>}
                </NameCell>
            ),
        },
    ];

    return (
        <DuplicatesRoot>
            <DuplicatesToolbar>
                <span>
                    {intl.formatMessage(
                        {
                            id: "dextinity.dam.file.duplicates.title",
                            defaultMessage: "{count, plural, =0 {No files found} one {# file} other {# files}}",
                        },
                        { count: duplicates.length },
                    )}
                </span>
                <IconButton
                    aria-label={intl.formatMessage({ id: "dextinity.dam.file.duplicates.refresh", defaultMessage: "Refresh" })}
                    variant="outlined"
                    color="secondary"
                    size="small"
                    loading={loading && data != null}
                    onClick={() => void refetch()}
                >
                    <Icon name="reload" />
                </IconButton>
            </DuplicatesToolbar>
            <DataGrid
                aria-label={intl.formatMessage({ id: "dextinity.dam.file.duplicates.tabTitle", defaultMessage: "Duplicates" })}
                columns={columns}
                rows={duplicates}
                getRowId={(duplicate) => duplicate.id}
                loading={loading && data == null}
                loadingRowCount={2}
                onRowClick={(duplicate) => history.push(getEditUrl(duplicate.id))}
                rowActions={(duplicate) => (
                    <IconButton
                        aria-label={intl.formatMessage({ id: "dextinity.dam.file.duplicates.openInNewTab", defaultMessage: "Open in new tab" })}
                        variant="text"
                        color="secondary"
                        size="small"
                        onClick={() => window.open(history.createHref({ pathname: getEditUrl(duplicate.id) }), "_blank")}
                    >
                        <Icon name="open-new-tab" />
                    </IconButton>
                )}
                labels={dataGridLabels}
                emptyState={
                    <EmptyState
                        icon={<Icon name="duplicate" />}
                        title={intl.formatMessage({ id: "dextinity.dam.file.duplicates.empty", defaultMessage: "No duplicates" })}
                        description={intl.formatMessage({
                            id: "dextinity.dam.file.duplicates.emptyDescription",
                            defaultMessage: "No other file in the DAM has the same content.",
                        })}
                    />
                }
            />
            <Banner tone="info">
                <InfoTitle>
                    {intl.formatMessage({ id: "dextinity.dam.file.duplicates.info.title", defaultMessage: "What are duplicate assets?" })}
                </InfoTitle>
                {intl.formatMessage({
                    id: "dextinity.dam.file.duplicates.info.content",
                    defaultMessage:
                        "Duplicates refer to one or more identical copies of a digital asset stored in the DAM system. The DAM automatically detects identical assets, even if their file names are different, to reduce storage usage.",
                })}
            </Banner>
        </DuplicatesRoot>
    );
}
