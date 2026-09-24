import { Tooltip } from "@comet/admin";
import { Invisible, Visible } from "@comet/admin-icons";
import { FormattedMessage } from "react-intl";

interface DependencyVisibilityIndicatorProps {
    visible: boolean;
}

export const DependencyVisibilityIndicator = ({ visible }: DependencyVisibilityIndicatorProps) => {
    return (
        <Tooltip
            title={
                visible ? (
                    <FormattedMessage id="comet.dependencies.dataGrid.visibleTooltip" defaultMessage="Visible" />
                ) : (
                    <FormattedMessage id="comet.dependencies.dataGrid.notVisibleTooltip" defaultMessage="Not visible" />
                )
            }
        >
            {visible ? <Visible sx={{ color: "success.main" }} /> : <Invisible sx={{ color: "grey.300" }} />}
        </Tooltip>
    );
};
