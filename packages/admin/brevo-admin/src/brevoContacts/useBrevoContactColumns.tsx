import type { DataGridColumn } from "@dextinity/ui";
import { FormattedDate, useIntl } from "react-intl";

import type { GQLBrevoContactsListItemFragment } from "./brevoContactsListItemFragment.generated";
import { ContactStatus } from "./ContactStatus";
import { Muted } from "./useBrevoContactColumns.sc";

/**
 * The columns of a contacts list: the email address, the status and the dates. `additionalColumns` are shown after the email address.
 */
export function useBrevoContactColumns<Row extends GQLBrevoContactsListItemFragment>(
    additionalColumns: DataGridColumn<Row>[] = [],
): DataGridColumn<Row>[] {
    const intl = useIntl();
    return [
        {
            key: "email",
            header: intl.formatMessage({ id: "dextinity.brevoContact.email", defaultMessage: "Email" }),
            hideable: false,
        },
        ...additionalColumns,
        {
            key: "emailBlacklisted",
            header: intl.formatMessage({ id: "dextinity.brevoContact.status", defaultMessage: "Status" }),
            width: 130,
            render: (contact) => <ContactStatus blocked={contact.emailBlacklisted} />,
            exportValue: (contact) =>
                contact.emailBlacklisted
                    ? intl.formatMessage({ id: "dextinity.brevoContact.status.blocked", defaultMessage: "Blocked" })
                    : intl.formatMessage({ id: "dextinity.brevoContact.status.subscribed", defaultMessage: "Subscribed" }),
        },
        {
            key: "createdAt",
            header: intl.formatMessage({ id: "dextinity.brevoContact.subscribedAt", defaultMessage: "Subscribed at" }),
            width: 140,
            priority: "low",
            render: (contact) => (
                <Muted>
                    <FormattedDate value={contact.createdAt} dateStyle="medium" />
                </Muted>
            ),
        },
        {
            key: "modifiedAt",
            header: intl.formatMessage({ id: "dextinity.brevoContact.modifiedAt", defaultMessage: "Modified at" }),
            width: 140,
            priority: "low",
            render: (contact) => (
                <Muted>
                    <FormattedDate value={contact.modifiedAt} dateStyle="medium" />
                </Muted>
            ),
        },
    ];
}
