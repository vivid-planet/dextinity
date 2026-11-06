import { Stack } from "@dextinity/admin";
import { Icon } from "@dextinity/ui";
import { useState } from "react";

import { createCompositeBlock } from "../../factories/createCompositeBlock";
import { createCompositeBlockSelectField } from "../createCompositeBlockSelectField";

export default {
    title: "blocks/helpers/createCompositeBlockSelectField",
};

export const Basic = () => {
    const CompositeBlock = createCompositeBlock({
        name: "Composite",
        displayName: "Composite",
        blocks: {
            variant: {
                block: createCompositeBlockSelectField<"primary" | "secondary" | "tertiary">({
                    label: "Variant",
                    defaultValue: "primary",
                    options: [
                        { value: "primary", label: "Primary" },
                        { value: "secondary", label: "Secondary" },
                        { value: "tertiary", label: "Tertiary" },
                    ],
                }),
            },
        },
    });

    const [state, setState] = useState(CompositeBlock.defaultValues());

    return (
        <Stack topLevelTitle={null}>
            <CompositeBlock.AdminComponent state={state} updateState={setState} />
        </Stack>
    );
};

export const WithIcon = () => {
    const CompositeBlock = createCompositeBlock({
        name: "Composite",
        displayName: "Composite",
        blocks: {
            density: {
                block: createCompositeBlockSelectField<"compact" | "standard" | "comfortable">({
                    label: "Density",
                    defaultValue: "compact",
                    options: [
                        { value: "compact", label: "Compact", icon: <Icon name="density-compact" /> },
                        { value: "standard", label: "Standard", icon: <Icon name="density-standard" /> },
                        { value: "comfortable", label: "Comfortable", icon: <Icon name="density-comfortable" /> },
                    ],
                }),
            },
        },
    });

    const [state, setState] = useState(CompositeBlock.defaultValues());

    return (
        <Stack topLevelTitle={null}>
            <CompositeBlock.AdminComponent state={state} updateState={setState} />
        </Stack>
    );
};
