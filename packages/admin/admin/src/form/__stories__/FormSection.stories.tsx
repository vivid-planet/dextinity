import { Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";

import { FormSection } from "../FormSection";

export default {
    title: "components/form/FormSection",
};

export const InfoTooltipExamples = {
    render: () => {
        return (
            <>
                <FormSection
                    title="FormSection"
                    slotProps={{
                        title: { infoTooltipText: "Hello" },
                    }}
                >
                    <Typography>
                        Using <strong>deprecated</strong> infoTooltipText prop through slotProps.title
                    </Typography>
                </FormSection>
                <FormSection title="FormSection" infoTooltip="Hello">
                    <Typography>Using infoTooltip prop, using string directly</Typography>
                </FormSection>
                <FormSection
                    title="FormSection"
                    infoTooltip={<FormattedMessage id="stories.formSectionl.infoTooltipExamples.hello" defaultMessage="Hello" />}
                >
                    <Typography>Using infoTooltip prop, using FormattedMessage directly</Typography>
                </FormSection>
                <FormSection
                    title="FormSection"
                    infoTooltip={{
                        title: "Hello",
                    }}
                >
                    <Typography>Using infoTooltip prop, using object for title only</Typography>
                </FormSection>
                <FormSection
                    title="FormSection"
                    infoTooltip={{
                        title: "Hello",
                        description: "Lorem ipsum",
                        color: "light",
                    }}
                >
                    <Typography>Using infoTooltip prop, using object for title, description and variant</Typography>
                </FormSection>
                <FormSection
                    title="FormSection"
                    infoTooltip={{
                        customContent: (
                            <>
                                <Typography variant="subtitle1">Hello</Typography>
                                <Typography variant="body1">Lorem ipsum</Typography>
                            </>
                        ),
                    }}
                >
                    <Typography>Using infoTooltip prop, using object for custom content</Typography>
                </FormSection>
            </>
        );
    },
};
