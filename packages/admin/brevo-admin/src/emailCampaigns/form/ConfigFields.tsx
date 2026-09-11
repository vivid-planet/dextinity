import { Field, FinalFormInput } from "@dextinity/admin";
import { FormattedMessage } from "react-intl";

export const ConfigFields = () => {
    return (
        <>
            <Field
                required
                fullWidth
                name="title"
                component={FinalFormInput}
                label={<FormattedMessage id="dextinity.emailCampaigns.title" defaultMessage="Title" />}
            />
            <Field
                required
                fullWidth
                name="subject"
                component={FinalFormInput}
                label={<FormattedMessage id="dextinity.emailCampaigns.subject" defaultMessage="Subject" />}
            />
        </>
    );
};
