import { Icon, IconButton } from "@dextinity/ui";
import { useIntl } from "react-intl";

interface Props {
    showOnlyVisible: boolean;
    onChange: (showOnlyVisible: boolean) => void;
}

function VisibilityToggle({ showOnlyVisible, onChange }: Props) {
    const intl = useIntl();

    return (
        <IconButton
            variant="text"
            color="secondary"
            size="small"
            aria-label={
                showOnlyVisible
                    ? intl.formatMessage({ id: "dextinity.preview.showInvisible", defaultMessage: "Show invisible blocks" })
                    : intl.formatMessage({ id: "dextinity.preview.showOnlyVisible", defaultMessage: "Show only visible blocks" })
            }
            onClick={() => onChange(!showOnlyVisible)}
        >
            <Icon name={showOnlyVisible ? "invisible-item-show" : "invisible-item-hide"} />
        </IconButton>
    );
}

export { VisibilityToggle };
