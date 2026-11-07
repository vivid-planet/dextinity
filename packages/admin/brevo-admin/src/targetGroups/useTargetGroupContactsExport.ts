import { gql, useApolloClient } from "@apollo/client";
import type { ContentScope } from "@dextinity/cms-admin";
import { type DataGridColumn, downloadDataGridCsv } from "@dextinity/ui";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import type { BrevoContactRow } from "../brevoContacts/BrevoContactsListPage";
import type { ExportTargetGroupOptions } from "./TargetGroupsPage";

const exportBatchSize = 100;

const exportContactsQuery = (exportTargetGroupOptions?: ExportTargetGroupOptions<object>) => gql`
    query TargetGroupExportContacts($targetGroupId: ID!, $offset: Int!, $limit: Int!, $scope: EmailCampaignContentScopeInput!) {
        brevoContacts(targetGroupId: $targetGroupId, offset: $offset, limit: $limit, scope: $scope) {
            nodes {
                id
                createdAt
                modifiedAt
                email
                emailBlacklisted
                smsBlacklisted
                ${exportTargetGroupOptions ? "...".concat(exportTargetGroupOptions.additionalAttributesFragment.name) : ""}
            }
            totalCount
        }
    }
    ${exportTargetGroupOptions?.additionalAttributesFragment.fragment ?? ""}
`;

type ExportedContact = BrevoContactRow<{ smsBlacklisted: boolean }>;

/**
 * Downloads all contacts of a target group as a CSV file, with the columns of `exportTargetGroupOptions.exportFields`.
 */
export function useTargetGroupContactsExport<AdditionalAttributes extends object>(
    scope: ContentScope,
    exportTargetGroupOptions?: ExportTargetGroupOptions<AdditionalAttributes>,
): (targetGroup: { id: string; title: string }) => Promise<void> {
    const client = useApolloClient();
    const intl = useIntl();

    return useCallback(
        async ({ id, title }) => {
            const query = exportContactsQuery(exportTargetGroupOptions as ExportTargetGroupOptions<object> | undefined);
            const contacts: ExportedContact[] = [];
            let totalCount = Infinity;
            while (contacts.length < totalCount) {
                const { data } = await client.query<{ brevoContacts: { nodes: ExportedContact[]; totalCount: number } }>({
                    query,
                    variables: { targetGroupId: id, offset: contacts.length, limit: exportBatchSize, scope },
                    fetchPolicy: "network-only",
                });
                contacts.push(...data.brevoContacts.nodes);
                totalCount = data.brevoContacts.totalCount;
                if (data.brevoContacts.nodes.length === 0) {
                    break;
                }
            }
            const yesNo = (value: boolean) =>
                value
                    ? intl.formatMessage({ id: "dextinity.targetGroup.export.yes", defaultMessage: "Yes" })
                    : intl.formatMessage({ id: "dextinity.targetGroup.export.no", defaultMessage: "No" });
            const columns: DataGridColumn<ExportedContact>[] = [
                {
                    key: "id",
                    header: intl.formatMessage({ id: "dextinity.targetGroup.export.brevoId", defaultMessage: "Brevo ID" }),
                    exportValue: (contact) => String(contact.id),
                },
                { key: "email", header: intl.formatMessage({ id: "dextinity.targetGroup.export.email", defaultMessage: "Email" }) },
                {
                    key: "emailBlacklisted",
                    header: intl.formatMessage({ id: "dextinity.targetGroup.export.emailBlacklisted", defaultMessage: "Email blacklisted" }),
                    exportValue: (contact) => yesNo(contact.emailBlacklisted),
                },
                {
                    key: "smsBlacklisted",
                    header: intl.formatMessage({ id: "dextinity.targetGroup.export.smsBlacklisted", defaultMessage: "Sms blacklisted" }),
                    exportValue: (contact) => yesNo(contact.smsBlacklisted),
                },
                ...((exportTargetGroupOptions?.exportFields ?? []) as unknown as DataGridColumn<ExportedContact>[]),
            ];
            downloadDataGridCsv(`${title}.csv`, { columns, rows: contacts });
        },
        [client, intl, scope, exportTargetGroupOptions],
    );
}
