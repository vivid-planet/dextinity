import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { FormLabel } from "../FormLabel";
import tokens from "../FormLabel.tokens.scss?raw";
import styles from "./formLabel.module.scss";

const helperIconOptions = {
    None: undefined,
    Info: <Icon name="info" />,
};

const meta = {
    component: FormLabel,
    title: "Building blocks/FormLabel",
    parameters: {
        tokens,
        rules: {
            dos: [
                "Label above the field, always visible.",
                "Mark required fields with an asterisk (`required`).",
                "Short labels that name the data, not the action.",
            ],
            donts: [
                "A placeholder as the only label.",
                "Marking required fields only by color.",
                "Long explanations in the label – put them in the helper text.",
            ],
        },
    },
    decorators: [themeDecorator],
    args: {
        children: "Label",
    },
    argTypes: {
        helperIcon: {
            control: "select",
            options: Object.keys(helperIconOptions),
            mapping: helperIconOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
        ref: { control: false },
    },
} satisfies Meta<typeof FormLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
    args: {
        required: true,
    },
};

export const Error: Story = {
    args: {
        error: true,
        required: true,
    },
};

export const WithHelperIcon: Story = {
    args: {
        helperIcon: <Icon name="info" />,
    },
};

export const LongLabel: Story = {
    args: {
        required: true,
        helperIcon: <Icon name="info" />,
        children: "The label of a field whose description is long enough to wrap onto a second line",
    },
    decorators: [(Story) => <div className={styles.longLabel}>{Story()}</div>],
};
