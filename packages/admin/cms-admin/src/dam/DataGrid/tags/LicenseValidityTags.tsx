import { WarningSolid } from "@dextinity/admin-icons";
import { formatDistanceToNow } from "date-fns";
import { FormattedMessage } from "react-intl";

import { Tag } from "./Tag";

const LicenseNotValidYetTag = () => {
    return (
        <Tag type="error">
            <WarningSolid />
            <FormattedMessage id="dextinity.pages.dam.tag.licenseNotValidYet" defaultMessage="License not valid yet" />
        </Tag>
    );
};

const LicenseExpiredTag = () => {
    return (
        <Tag type="error">
            <WarningSolid />
            <FormattedMessage id="dextinity.pages.dam.tag.licenseExpired" defaultMessage="License expired" />
        </Tag>
    );
};

interface LicenseExpiresSoonTagProps {
    expirationDate: Date;
}

const LicenseExpiresSoonTag = ({ expirationDate }: LicenseExpiresSoonTagProps) => {
    return (
        <Tag type="warning">
            <WarningSolid />
            <FormattedMessage
                id="dextinity.pages.dam.tag.licenseExpiresSoon"
                defaultMessage="License expires in {distance}"
                values={{
                    distance: formatDistanceToNow(expirationDate),
                }}
            />
        </Tag>
    );
};

interface LicenseValidityTagsProps {
    expirationDate?: Date;
    isNotValidYet?: boolean;
    expiresWithinThirtyDays?: boolean;
    hasExpired?: boolean;
}

export const LicenseValidityTags = ({ expirationDate, isNotValidYet, expiresWithinThirtyDays, hasExpired }: LicenseValidityTagsProps) => {
    return (
        <>
            {isNotValidYet && <LicenseNotValidYetTag />}
            {expirationDate && expiresWithinThirtyDays && <LicenseExpiresSoonTag expirationDate={expirationDate} />}
            {hasExpired && <LicenseExpiredTag />}
        </>
    );
};
