import { WarningSolid } from "@dextinity/admin-icons";
import { Chip } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { FormattedMessage } from "react-intl";

const LicenseNotValidYetTag = () => {
    return (
        <Chip
            color="error"
            icon={<WarningSolid />}
            label={<FormattedMessage id="dextinity.pages.dam.tag.licenseNotValidYet" defaultMessage="License not valid yet" />}
        />
    );
};

const LicenseExpiredTag = () => {
    return (
        <Chip
            color="error"
            icon={<WarningSolid />}
            label={<FormattedMessage id="dextinity.pages.dam.tag.licenseExpired" defaultMessage="License expired" />}
        />
    );
};

interface LicenseExpiresSoonTagProps {
    expirationDate: Date;
}

const LicenseExpiresSoonTag = ({ expirationDate }: LicenseExpiresSoonTagProps) => {
    return (
        <Chip
            color="warning"
            icon={<WarningSolid />}
            label={
                <FormattedMessage
                    id="dextinity.pages.dam.tag.licenseExpiresSoon"
                    defaultMessage="License expires in {distance}"
                    values={{
                        distance: formatDistanceToNow(expirationDate),
                    }}
                />
            }
        />
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
