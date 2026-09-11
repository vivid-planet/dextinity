import type { StaticSelectValue } from "@dextinity/admin-generator";
import { FormattedMessage } from "react-intl";

export const productTypeValues: StaticSelectValue[] = [
    { value: "cap", label: <FormattedMessage id="product.type.greatCap" defaultMessage="Great Cap" /> },
    { value: "shirt", label: "Shirt" },
    "tie",
];
