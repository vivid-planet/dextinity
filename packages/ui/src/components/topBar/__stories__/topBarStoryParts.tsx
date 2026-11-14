import { useState } from "react";

import { ScopeSwitcher, type ScopeSwitcherDimension } from "../../scopeSwitcher/ScopeSwitcher";
import { UserMenu } from "../../userMenu/UserMenu";

const scopeDimensions: ScopeSwitcherDimension[] = [
    {
        key: "country",
        label: "Country",
        options: [
            { value: "at", label: "Austria", shortLabel: "AT" },
            { value: "de", label: "Germany", shortLabel: "DE" },
            { value: "ch", label: "Switzerland", shortLabel: "CH" },
        ],
    },
    {
        key: "language",
        label: "Language",
        options: [
            { value: "de", label: "German", shortLabel: "de" },
            { value: "en", label: "English", shortLabel: "en" },
            { value: "fr", label: "French", shortLabel: "fr" },
        ],
    },
];

export function StoryScopeSwitcher() {
    const [value, setValue] = useState(["at", "de"]);
    const [open, setOpen] = useState(false);
    return <ScopeSwitcher dimensions={scopeDimensions} value={value} onChange={setValue} open={open} onOpenChange={setOpen} />;
}

export function StoryUserMenu({ onLogout }: { onLogout?: () => void }) {
    const [open, setOpen] = useState(false);
    return <UserMenu name="Max Mustermann" role="Editor" open={open} onOpenChange={setOpen} onLogout={onLogout} />;
}
