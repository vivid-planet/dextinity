import { Chip, type ChipProps } from "@mui/material";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import type { GQLActionLogType } from "../../../graphql.generated";

type ActionLogTypeChipProps = Omit<ChipProps, "label" | "color"> & { actionLogType: GQLActionLogType };

const labels: Record<GQLActionLogType, ReactNode> = {
    created: <FormattedMessage id="actionLog.actionLogTypeChip.created" defaultMessage="Created" />,
    updated: <FormattedMessage id="actionLog.actionLogTypeChip.updated" defaultMessage="Updated" />,
    deleted: <FormattedMessage id="actionLog.actionLogTypeChip.deleted" defaultMessage="Deleted" />,
};

const colors: Record<GQLActionLogType, ChipProps["color"]> = {
    created: "success",
    updated: "primary",
    deleted: "error",
};

export function ActionLogTypeChip({ actionLogType, ...restProps }: ActionLogTypeChipProps) {
    return <Chip {...restProps} color={colors[actionLogType]} label={labels[actionLogType]} />;
}
