/* eslint-disable no-console */

import { kebabCase } from "change-case";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

type StoriesJsonEntry = {
    id: string;
    title: string;
    type: "story" | "docs";
    tags: string[];
};

type StoriesJson = {
    v: number;
    entries: Record<string, StoriesJsonEntry>;
};

const getStaticStorybookIndexJson = () => {
    const jsonPath = path.resolve(process.cwd(), "../storybook/storybook-static/index.json");
    const json = readFileSync(jsonPath, "utf8");
    return JSON.parse(json);
};

const getRunningStorybookIndexJson = async () => {
    const response = await fetch("http://localhost:26638/index.json");
    return response.json();
};

const getAdminComponentDocsStories = async (): Promise<StoriesJsonEntry[]> => {
    let storiesJson: StoriesJson;

    if (process.env.FETCH_FROM_RUNNING_STORYBOOK === "true") {
        storiesJson = await getRunningStorybookIndexJson();
    } else {
        storiesJson = getStaticStorybookIndexJson();
    }

    return Object.values(storiesJson.entries).filter(({ tags, type }) => tags.includes("adminComponentDocs") && type === "docs");
};

const main = async () => {
    const stories = await getAdminComponentDocsStories();
    console.log(`Generating component docs for ${stories.length} components...`);
    generateComponentDocs(stories);
};

const generateComponentDocs = (stories: StoriesJsonEntry[]) => {
    const docsDir = path.resolve(process.cwd(), "docs/5-admin-components/components");

    stories.forEach(({ id, title }) => {
        const componentName = title.split("/")[1];
        if (!componentName) {
            return;
        }

        const fileName = `generated.${kebabCase(componentName)}.mdx`;
        const filePath = path.join(docsDir, fileName);

        const content = getDocsFileContent(componentName, id);
        writeFileSync(filePath, content);
        console.log(`- ${filePath}`);
    });
};

const getDocsFileContent = (componentName: string, storyId: string) => {
    return `---
title: ${componentName}
slug: ${kebabCase(componentName)}
---

import { StorybookAdminComponentDocsIframe } from "../../../src/components/StorybookAdminComponentDocsIframe";

# ${componentName}

<StorybookAdminComponentDocsIframe storyId="${storyId}" />
`;
};

void main();
