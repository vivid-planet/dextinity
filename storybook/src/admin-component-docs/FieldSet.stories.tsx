import { FieldSet } from "@dextinity/admin";
import { Chip } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof FieldSet>;

const meta: Meta<typeof FieldSet> = {
    component: FieldSet,
    title: "Component Docs/FieldSet",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={Default} />,
        },
    },
    argTypes: {
        title: {
            control: "text",
            description: "Title of the FieldSet",
        },
        supportText: {
            control: "text",
            description: "Additional line below the Title",
        },
        endAdornment: {
            control: "select",
            options: [undefined, "Text in Chip"],
            description: "An element on the right end of the FieldSetSummary",
        },
        collapsible: {
            control: "boolean",
            description: "If true, FieldSet can be opened and closed (Accordion behavior)",
        },
        initiallyExpanded: {
            control: "boolean",
            description: "If false, FieldSet is closed by default",
        },
        disablePadding: {
            control: "boolean",
            description: "If true, content will have no padding",
        },
    },
    args: {
        title: "FieldSet Title",
        children: "FieldSet content",
    },
};

export default meta;

/**
 * The `FieldSet` component is intended for better structuring of big forms.
 * It allows the user to show and hide sections of related content on a page.
 */
export const Default: Story = {
    render: (props) => {
        return <FieldSet {...props} endAdornment={props.endAdornment === "Text in Chip" ? <Chip label="Text in Chip" /> : undefined} />;
    },
};
