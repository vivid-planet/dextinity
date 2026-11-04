import { useCallback, useState } from "react";

import { Savable, SaveBoundary } from "../SaveBoundary";
import { SaveBoundarySaveButton } from "../SaveBoundarySaveButton";

async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

function DemoForm() {
    console.log("Render DemoForm");
    const [saving, setSaving] = useState(false);
    const [input, setInput] = useState("");

    const doSave = useCallback(async () => {
        setSaving(true);
        await delay(1000);
        setSaving(false);
        if (input == "err") {
            return false;
        }
        return true;
    }, [input]);
    return (
        <div>
            DemoForm <Savable hasChanges={input != ""} doSave={doSave} />
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            {saving && <>Saving...</>}
        </div>
    );
}
function UnrelatedChild() {
    console.log("Render UnrelatedChild");
    return <p>UnrelatedChild</p>;
}

function SaveButtonContainer() {
    console.log("Render SaveButtonContainer");
    return <SaveBoundarySaveButton />;
}

export default {
    title: "components/saveBoundary/SaveBoundary",
};

export const _SaveBoundary = {
    render: () => {
        return (
            <SaveBoundary>
                <DemoForm />
                <DemoForm />
                <UnrelatedChild />
                <SaveButtonContainer />
            </SaveBoundary>
        );
    },

    name: "SaveBoundary",
};
