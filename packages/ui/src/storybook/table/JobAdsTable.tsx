import type { ReactNode } from "react";

import { TableBody } from "../../components/table/TableBody";
import { TableCell } from "../../components/table/TableCell";
import { TableHeader } from "../../components/table/TableHeader";
import { TableHeaderCell } from "../../components/table/TableHeaderCell";
import { TableRoot } from "../../components/table/TableRoot";
import { TableRow } from "../../components/table/TableRow";

interface JobAdsTableProps {
    header?: ReactNode;
    body?: ReactNode;
}

/**
 * A small static table for the stories of the table parts, which shows the part in `header` or `body`.
 */
export function JobAdsTable({
    header = (
        <TableHeader>
            <TableHeaderCell columnId="title">Title</TableHeaderCell>
            <TableHeaderCell columnId="applicants">Applicants</TableHeaderCell>
        </TableHeader>
    ),
    body = (
        <TableBody>
            <TableRow>
                <TableCell columnId="title">Senior UX Designer</TableCell>
                <TableCell columnId="applicants">12</TableCell>
            </TableRow>
        </TableBody>
    ),
}: JobAdsTableProps) {
    return (
        <TableRoot aria-label="Job ads" columns={[{ id: "title" }, { id: "applicants", width: 120, align: "end" }]}>
            {header}
            {body}
        </TableRoot>
    );
}
