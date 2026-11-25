interface WarningMessageLabel {
    message: string;
    label: string;
}

// The database only stores the message key, while users search for the translated message they see in the admin.
export function findMessagesMatchingSearchPart(searchPart: string, messageLabels: WarningMessageLabel[]): string[] {
    const searchPartRegExp = ilikePatternToRegExp(searchPart);
    return messageLabels.filter(({ label }) => searchPartRegExp.test(label)).map(({ message }) => message);
}

function ilikePatternToRegExp(pattern: string): RegExp {
    let source = "";
    for (let i = 0; i < pattern.length; i++) {
        const character = pattern[i];
        if (character === "\\" && i + 1 < pattern.length) {
            i++;
            source += escapeRegExp(pattern[i]);
        } else if (character === "%") {
            source += ".*";
        } else if (character === "_") {
            source += ".";
        } else {
            source += escapeRegExp(character);
        }
    }
    return new RegExp(`^${source}$`, "is");
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
