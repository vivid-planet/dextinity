import { Button, type ButtonProps } from "@dextinity/admin";
import { Time } from "@dextinity/admin-icons";
import { type PropsWithChildren, useState } from "react";
import { FormattedMessage } from "react-intl";

import type { ContentScope } from "../../../contentScope/Provider";
import { ActionLogDialog } from "../actionLogDialog/ActionLogDialog";

type ActionLogButtonProps = PropsWithChildren<
    Omit<ButtonProps, "onClick" | "children"> & {
        entityId: string;
        /**
         * Class name of the logged entity, for instance `"News"`.
         */
        entity: string;
        /**
         * Latest name of the entity, displayed in titles.
         */
        name?: string;
        /**
         * Scope of the entity. Defaults to the current content scope.
         */
        scope?: ContentScope;
    }
>;

export function ActionLogButton({
    entityId,
    entity,
    name,
    scope,
    children,
    startIcon = <Time />,
    variant = "textDark",
    ...restProps
}: ActionLogButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button {...restProps} variant={variant} startIcon={startIcon} onClick={() => setOpen(true)}>
                {children ?? <FormattedMessage id="dextinity.actionLogButton.title" defaultMessage="Action Log" />}
            </Button>
            <ActionLogDialog entity={entity} entityId={entityId} name={name} scope={scope} open={open} onClose={() => setOpen(false)} />
        </>
    );
}
