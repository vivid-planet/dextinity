import { FinalForm } from "@dextinity/admin";
import { ColorField } from "@dextinity/admin-color-picker";
import { ArrowRight } from "@dextinity/admin-icons";
import { InputAdornment } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { argTypes } from "./ColorPicker.stories";
import { commonFieldComponentArgTypes } from "./utils/commonArgTypes";
import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof ColorField>;

const meta: Meta<typeof ColorField> = {
    component: ColorField,
    title: "Component Docs/ColorField",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={Default} />,
        },
    },
    argTypes: {
        ...argTypes,
        ...commonFieldComponentArgTypes,
    },
    args: {
        name: "color",
        label: "Color",
    },
};

export default meta;

/**
 * The `ColorField` component is used to select colors in a Final Form, e.g., a HEX code or an RGBA string.
 *
 * For usage outside of Final Form, use the `ColorPicker` component.
 */
export const Default: Story = {
    render: ({ startAdornment, endAdornment, ...props }) => {
        return (
            <FinalForm mode="edit" onSubmit={() => {}}>
                <ColorField
                    {...props}
                    startAdornment={
                        startAdornment === "ArrowRight" ? (
                            <InputAdornment position="start">
                                <ArrowRight />
                            </InputAdornment>
                        ) : undefined
                    }
                    endAdornment={
                        endAdornment === "ArrowRight" ? (
                            <InputAdornment position="end">
                                <ArrowRight />
                            </InputAdornment>
                        ) : undefined
                    }
                />
            </FinalForm>
        );
    },
};
