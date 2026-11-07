import type { IntlShape } from "react-intl";

import type { GQLLicenseType } from "../../graphql.generated";

export type LicenseType = GQLLicenseType | "NO_LICENSE";

export const licenseTypes: readonly LicenseType[] = ["NO_LICENSE", "ROYALTY_FREE", "RIGHTS_MANAGED"];

export function getLicenseTypeLabel(intl: IntlShape, licenseType: LicenseType) {
    switch (licenseType) {
        case "NO_LICENSE":
            return intl.formatMessage({ id: "dextinity.dam.file.licenseType.none", defaultMessage: "No license" });
        case "ROYALTY_FREE":
            return intl.formatMessage({ id: "dextinity.dam.file.licenseType.royaltyFree", defaultMessage: "Royalty free" });
        case "RIGHTS_MANAGED":
            return intl.formatMessage({ id: "dextinity.dam.file.licenseType.rightsManaged", defaultMessage: "Rights managed" });
    }
}
