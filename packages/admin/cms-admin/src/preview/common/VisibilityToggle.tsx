import { InvisibleItemHide, InvisibleItemShow } from "@dextinity/admin-icons";
import { useIntl } from "react-intl";

import { ToggleButton } from "./ToggleButton";

interface Props {
    showOnlyVisible: boolean;
    onChange: (showOnlyVisible: boolean) => void;
}

function VisibilityToggle({ showOnlyVisible, onChange }: Props) {
    const intl = useIntl();

    const handleToggleVisibilityClick = () => {
        onChange(!showOnlyVisible);
    };

    return (
        <ToggleButton
            value="showOnlyVisbile"
            onClick={handleToggleVisibilityClick}
            selected={!showOnlyVisible}
            title={intl.formatMessage({
                id: "dextinity.preview.showOnlyVisible",
                defaultMessage: "Show only visible blocks",
            })}
        >
            {showOnlyVisible ? <InvisibleItemHide /> : <InvisibleItemShow />}
        </ToggleButton>
    );
}

export { VisibilityToggle };
