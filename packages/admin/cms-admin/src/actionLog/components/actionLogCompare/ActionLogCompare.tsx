import { Button, InlineAlert, Loading, useStoredState } from "@dextinity/admin";
import { ArrowLeft } from "@dextinity/admin-icons";
import { Box, FormControlLabel, Switch, useMediaQuery, useTheme } from "@mui/material";
import type { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";

import { ActionLogHeader } from "../actionLogHeader/ActionLogHeader";
import { DiffHeader } from "../diffHeader/DiffHeader";
import { DiffViewer } from "../diffViewer/DiffViewer";
import type { GQLActionLogCompareFragment } from "./ActionLogCompare.gql.generated";
import { LoadingContainer, PaperStyled, Root } from "./ActionLogCompare.styles";
import { defaultFilterOutKeys, filterOutKeys } from "./ActionLogCompare.utils";

type ActionLogCompareProps = {
    afterVersion: GQLActionLogCompareFragment | undefined;
    beforeVersion: GQLActionLogCompareFragment | undefined;
    error?: boolean;
    filterKeys?: string[];
    id: string;
    loading: boolean;
    /**
     * Latest name of the actual object, displayed in the title
     */
    name?: string;
    onClickShowVersionHistory?: () => void;
};

export const ActionLogCompare: FunctionComponent<ActionLogCompareProps> = ({
    afterVersion,
    beforeVersion,
    error,
    filterKeys: passedFilterKeys,
    id,
    loading,
    name,
    onClickShowVersionHistory,
}) => {
    const [onlyShowChanges, setOnlyShowChanges] = useStoredState<boolean>("actionLogCompare.onlyShowChanges", false);
    const filterKeys = passedFilterKeys != null ? [...passedFilterKeys, ...defaultFilterOutKeys] : defaultFilterOutKeys;

    const theme = useTheme();
    const smallBreakpoint = useMediaQuery(theme.breakpoints.down("md"));

    const filteredSnapshotBeforeVersion = filterOutKeys(beforeVersion?.snapshot, filterKeys);
    const filteredSnapshotAfterVersion = filterOutKeys(afterVersion?.snapshot, filterKeys);

    return (
        <Root>
            {onClickShowVersionHistory && (
                <Box marginBottom={4}>
                    <Button onClick={onClickShowVersionHistory} startIcon={<ArrowLeft />} variant="primary">
                        <FormattedMessage defaultMessage="Show Version History" id="actionLog.actionLogCompare.showVersionHistory" />
                    </Button>
                </Box>
            )}

            <ActionLogHeader
                action={
                    <FormControlLabel
                        control={
                            <Switch
                                checked={onlyShowChanges}
                                onChange={(event, checked) => {
                                    setOnlyShowChanges(checked);
                                }}
                            />
                        }
                        label={<FormattedMessage defaultMessage="Show Changes Only" id="actionLog.actionLogCompare.onlyShowChanges.switchLabel" />}
                    />
                }
                dbTypes={Array.from(new Set([beforeVersion?.entityName ?? "", afterVersion?.entityName ?? ""]))}
                id={id}
                title={
                    <FormattedMessage
                        defaultMessage="Content Comparison {name}"
                        id="actionLog.actionLogCompare.title"
                        values={{
                            name: name != null ? `- ${name}` : "",
                        }}
                    />
                }
            />

            {loading && (
                <LoadingContainer>
                    <Loading behavior="auto" />
                </LoadingContainer>
            )}

            {error && <InlineAlert />}

            {!loading && !error && (afterVersion == null || beforeVersion == null) && (
                <Box margin={6}>
                    <InlineAlert
                        title={<FormattedMessage id="actionLog.actionLogCompare.notFound.title" defaultMessage="Versions not found" />}
                        description={
                            <FormattedMessage
                                id="actionLog.actionLogCompare.notFound.description"
                                defaultMessage="One or both of the requested versions could not be found."
                            />
                        }
                    />
                </Box>
            )}
            {afterVersion != null && beforeVersion != null && (
                <PaperStyled>
                    <DiffViewer
                        leftTitle={
                            smallBreakpoint ? (
                                <>
                                    <DiffHeader
                                        createdAt={beforeVersion?.createdAt}
                                        userId={beforeVersion?.user.id}
                                        userName={beforeVersion?.user.name ?? undefined}
                                        version={beforeVersion?.version}
                                    />

                                    <DiffHeader
                                        createdAt={afterVersion?.createdAt}
                                        userId={afterVersion?.user.id}
                                        userName={afterVersion?.user.name ?? undefined}
                                        version={afterVersion?.version}
                                    />
                                </>
                            ) : (
                                <DiffHeader
                                    createdAt={beforeVersion?.createdAt}
                                    userId={beforeVersion?.user.id}
                                    userName={beforeVersion?.user.name ?? undefined}
                                    version={beforeVersion?.version}
                                />
                            )
                        }
                        newValue={JSON.stringify(filteredSnapshotAfterVersion, null, 8)}
                        oldValue={JSON.stringify(filteredSnapshotBeforeVersion, null, 8)}
                        rightTitle={
                            <DiffHeader
                                createdAt={afterVersion?.createdAt}
                                userId={afterVersion?.user.id}
                                userName={afterVersion?.user.name ?? undefined}
                                version={afterVersion?.version}
                            />
                        }
                        showDiffOnly={onlyShowChanges}
                        splitView={!smallBreakpoint}
                    />
                </PaperStyled>
            )}
        </Root>
    );
};

export { actionLogCompareFragment } from "./ActionLogCompare.gql";
