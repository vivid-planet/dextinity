import { Button, type ButtonProps } from "@comet/admin";
import { Time } from "@comet/admin-icons";
import { type PropsWithChildren, useState } from "react";
import { FormattedMessage } from "react-intl";

import { ActionLogDialog, type ActionLogQueryName } from "../actionLogDialog/ActionLogDialog";

type ActionLogButtonProps<TQuery> = PropsWithChildren<
    Omit<ButtonProps, "onClick" | "children"> & {
        entityId: string;
        /**
         * Name of the top-level entity-scoped action log query field (e.g. `"newsActionLogs"`).
         *
         * Pass your app's `GQLQuery` as the generic to constrain this to a real action log query name.
         */
        queryName: ActionLogQueryName<TQuery>;
        /**
         * Latest name of the entity, displayed in titles.
         */
        name?: string;
    }
>;

export function ActionLogButton<TQuery = Record<string, unknown>>({
    entityId,
    queryName,
    name,
    children,
    startIcon = <Time />,
    variant = "textDark",
    ...restProps
}: ActionLogButtonProps<TQuery>) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button {...restProps} variant={variant} startIcon={startIcon} onClick={() => setOpen(true)}>
                {children ?? <FormattedMessage id="comet.actionLogButton.title" defaultMessage="Action Log" />}
            </Button>
            <ActionLogDialog<TQuery> entityId={entityId} queryName={queryName} name={name} open={open} onClose={() => setOpen(false)} />
        </>
    );
}
