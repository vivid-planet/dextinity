import { ChevronLeft, ChevronRight } from "@dextinity/admin-icons";
import { Grid, IconButton, Toolbar, Typography } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import { FormattedMessage, FormattedNumber } from "react-intl";

import type { IPagingInfo } from "./paging/IPagingInfo";

interface IProps {
    totalCount: number;
    pagingInfo: IPagingInfo;
    rowName?: string | ((count: number) => string);
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export const TablePagination = ({ totalCount, pagingInfo, rowName }: IProps) => {
    if (typeof rowName === "function") {
        rowName = rowName(totalCount);
    }
    return (
        <TableCell colSpan={1000}>
            <Toolbar>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid>
                        <Typography color="textPrimary" variant="body2">
                            <FormattedNumber value={totalCount} /> {rowName}
                        </Typography>
                    </Grid>
                    <Grid>
                        <Grid container alignItems="center" spacing={2}>
                            {pagingInfo.totalPages && pagingInfo.currentPage && (
                                <Grid>
                                    <Typography color="textSecondary" variant="body2">
                                        <FormattedMessage
                                            id="dextinity.table.pagination.pageInfo"
                                            values={{ total: pagingInfo.totalPages, current: pagingInfo.currentPage }}
                                            defaultMessage="Page {current} of {total}"
                                            description="Pagination-info"
                                        />
                                    </Typography>
                                </Grid>
                            )}
                            <Grid>
                                <IconButton disabled={!pagingInfo.fetchPreviousPage} onClick={() => pagingInfo.fetchPreviousPage!()} size="large">
                                    <ChevronLeft />
                                </IconButton>
                                <IconButton disabled={!pagingInfo.fetchNextPage} onClick={() => pagingInfo.fetchNextPage!()} size="large">
                                    <ChevronRight />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Toolbar>
        </TableCell>
    );
};
