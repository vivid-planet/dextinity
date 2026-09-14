import { readFile } from "fs/promises";
import type { ResolvedIntlConfig } from "react-intl";

type Messages = ResolvedIntlConfig["messages"];

const messagesCache: Record<string, Messages> = {};

export async function loadMessages(language: string) {
    if (messagesCache[language]) {
        return messagesCache[language];
    }
    const path = `lang-compiled/dextinity-demo-api/${language}.json`;
    const messages = JSON.parse(await readFile(path, "utf8"));
    messagesCache[language] = messages;
    return messages;
}
