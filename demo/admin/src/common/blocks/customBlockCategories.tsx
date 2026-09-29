import { BlockCategory } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

const customBlockCategory = {
    id: "Custom",
    label: <FormattedMessage id="blocks.category.custom" defaultMessage="Custom" />,
    insertBefore: BlockCategory.Media,
};

export { customBlockCategory };
