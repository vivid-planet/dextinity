import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormattedMessage } from "react-intl";

import { SectionHeadline } from "../SectionHeadline";

type Story = StoryObj<typeof SectionHeadline>;
const config: Meta<typeof SectionHeadline> = {
    component: SectionHeadline,
    title: "components/section/SectionHeadline",
};

export default config;

export const Default: Story = {
    render: () => (
        <Stack spacing={15}>
            <SectionHeadline supportText="Support Text" divider infoTooltipText="Tooltip Info Text">
                Section Title
            </SectionHeadline>

            <SectionHeadline>Section Title</SectionHeadline>
        </Stack>
    ),
};

export const InfoTooltipExamples: Story = {
    render: () => (
        <Stack spacing={4}>
            <SectionHeadline infoTooltipText="Hello">
                Using <strong>deprecated</strong> infoTooltipText prop
            </SectionHeadline>
            <SectionHeadline infoTooltip="Hello">Using infoTooltip prop, using string directly</SectionHeadline>
            <SectionHeadline infoTooltip={<FormattedMessage id="stories.formSectionl.infoTooltipExamples.hello" defaultMessage="Hello" />}>
                Using infoTooltip prop, using FormattedMessage directly
            </SectionHeadline>
            <SectionHeadline
                infoTooltip={{
                    title: "Hello",
                }}
            >
                Using infoTooltip prop, using object for title only
            </SectionHeadline>
            <SectionHeadline
                infoTooltip={{
                    title: "Hello",
                    description: "Lorem ipsum",
                    color: "light",
                }}
            >
                Using infoTooltip prop, using object for title, description and variant
            </SectionHeadline>
            <SectionHeadline
                infoTooltip={{
                    customContent: (
                        <>
                            <Typography variant="subtitle1">Hello</Typography>
                            <Typography variant="body1">Lorem ipsum</Typography>
                        </>
                    ),
                }}
            >
                Using infoTooltip prop, using object for custom content
            </SectionHeadline>
        </Stack>
    ),
};
