import { InputField } from "@dextinity/ui-react-final-form";
import { useIntl } from "react-intl";

import { FormSection } from "../../common/form/FormSection";
import { TabBody } from "./EmailCampaignSettingsTab.sc";

export function EmailCampaignSettingsTab() {
    const intl = useIntl();
    const requiredMessage = intl.formatMessage({ id: "dextinity.emailCampaigns.required", defaultMessage: "Required" });
    return (
        <TabBody>
            <FormSection
                title={intl.formatMessage({ id: "dextinity.emailCampaigns.settings.basics", defaultMessage: "Basics" })}
                description={intl.formatMessage({
                    id: "dextinity.emailCampaigns.settings.basicsDescription",
                    defaultMessage: "The title is only shown in the admin; recipients see the subject in their inbox.",
                })}
            >
                <InputField
                    name="title"
                    label={intl.formatMessage({ id: "dextinity.emailCampaigns.title", defaultMessage: "Title" })}
                    required
                    requiredMessage={requiredMessage}
                />
                <InputField
                    name="subject"
                    label={intl.formatMessage({ id: "dextinity.emailCampaigns.subject", defaultMessage: "Subject" })}
                    required
                    requiredMessage={requiredMessage}
                />
            </FormSection>
        </TabBody>
    );
}
