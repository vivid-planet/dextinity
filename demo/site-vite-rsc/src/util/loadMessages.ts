import { readFile } from "fs/promises";

const messagesCache: Record<string, unknown> = {};

export async function loadMessages(language: string) {
    if (messagesCache[language]) {
        return messagesCache[language];
    }
    const path = `./lang-compiled/${language}.json`;
    const messages = JSON.parse(await readFile(path, "utf8"));
    messagesCache[language] = messages;
    return messages;
}
