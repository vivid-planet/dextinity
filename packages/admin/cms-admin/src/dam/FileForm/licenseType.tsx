import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import type { GQLLicenseType } from "../../graphql.generated";

export type LicenseType = GQLLicenseType | "NO_LICENSE";

export const licenseTypeArray: readonly LicenseType[] = ["NO_LICENSE", "ROYALTY_FREE", "RIGHTS_MANAGED"];

export const licenseTypeLabels: { [key in LicenseType]: ReactNode } = {
    NO_LICENSE: "-",
    ROYALTY_FREE: <FormattedMessage id="dextinity.dam.file.licenseType.royaltyFree" defaultMessage="Royalty free" />,
    RIGHTS_MANAGED: <FormattedMessage id="dextinity.dam.file.licenseType.rightsManaged" defaultMessage="Rights managed" />,
};
