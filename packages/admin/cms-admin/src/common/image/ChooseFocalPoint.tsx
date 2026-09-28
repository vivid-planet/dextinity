import { FocusPointCenter, FocusPointNortheast, FocusPointNorthwest, FocusPointSoutheast, FocusPointSouthwest } from "@dextinity/admin-icons";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FormattedMessage } from "react-intl";

import { BlockAdminComponentSection } from "../../blocks/common/BlockAdminComponentSection";
import type { GQLFocalPoint } from "../../graphql.generated";

interface ChooseFocalPointProps {
    focalPoint: GQLFocalPoint;
    onChangeFocalPoint: (newFocalPoint: GQLFocalPoint) => void;
}

export const ChooseFocalPoint = ({ focalPoint, onChangeFocalPoint }: ChooseFocalPointProps) => {
    return (
        <BlockAdminComponentSection
            title={<FormattedMessage id="dextinity.blocks.image.focalPoint" defaultMessage="Set manual focus point" />}
            disableBottomMargin
        >
            <ToggleButtonGroup
                value={focalPoint}
                onChange={(event, newFocalPoint: GQLFocalPoint) => {
                    if (newFocalPoint === null) {
                        return;
                    }

                    onChangeFocalPoint(newFocalPoint);
                }}
                exclusive
            >
                <ToggleButton value="SOUTHWEST">
                    <FocusPointSouthwest />
                </ToggleButton>
                <ToggleButton value="NORTHWEST">
                    <FocusPointNorthwest />
                </ToggleButton>
                <ToggleButton value="CENTER">
                    <FocusPointCenter />
                </ToggleButton>
                <ToggleButton value="NORTHEAST">
                    <FocusPointNortheast />
                </ToggleButton>
                <ToggleButton value="SOUTHEAST">
                    <FocusPointSoutheast />
                </ToggleButton>
            </ToggleButtonGroup>
        </BlockAdminComponentSection>
    );
};
