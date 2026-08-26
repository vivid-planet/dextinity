import { SaveButton } from "@dextinity/admin";
import { useState } from "react";

export default {
    title: "Docs/Components/SaveButton",
};

export const Basic = {
    render: () => {
        return (
            <SaveButton
                onClick={() => {
                    return new Promise((resolve) => setTimeout(resolve, 1000));
                }}
            />
        );
    },
    name: "SaveButton",
};

export const Controlled = {
    render: () => {
        const [saving, setSaving] = useState(false);
        return (
            <SaveButton
                loading={saving}
                onClick={() => {
                    setSaving(true);
                    setTimeout(() => {
                        setSaving(false);
                    }, 1000);
                }}
            />
        );
    },
};
