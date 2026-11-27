import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import {
    type ComponentManifest,
    type ComponentManifestMapV0,
    type Doc,
    type DocsManifestMapV0,
    formatComponentManifest,
    formatDocsManifest,
    formatStoryDocumentation,
    MAX_STORIES_TO_SHOW,
} from "storybook/internal/toolsets-docs";

const SKILL_NAME = "dextinity-mail-react";

const SKILL_DESCRIPTION =
    "Guide for building HTML emails with @dextinity/mail-react and MJML. Use whenever working on email templates, mail markup, MJML components, email theming, email styling, responsive emails, column layouts, multi-column email sections, rendering Dextinity CMS block data (such as pixel-image blocks) in emails, or anything involving @dextinity/mail-react or HTML email development — even for seemingly simple tasks like putting content side-by-side in columns, since email client compatibility is a minefield that requires specific patterns and research before implementing.";

// Inlined into SKILL.md instead of a reference file, so agents can't skip it
const REQUIRED_DOCS_ID = "docs-email-client-pitfalls--docs";

interface Manifests {
    docs: DocsManifestMapV0;
    components: ComponentManifestMapV0;
}

// The Storybook build writes the same manifests that its MCP server reads, so the skill contains what `docs-show` returns
function buildManifests(mailReactDir: string): Manifests {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "dextinity-mail-react-storybook-"));
    try {
        execFileSync("pnpm", ["exec", "storybook", "build", "--quiet", "--output-dir", outputDir], { cwd: mailReactDir, stdio: "inherit" });
        const docs = readManifest(path.join(outputDir, "manifests", "docs.json"));
        const components = readManifest(path.join(outputDir, "manifests", "components.json"));
        return { docs, components };
    } finally {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
}

// Version 0 has the content of all entries inline. Later versions point to separate files that we would need to resolve.
function readManifest(filePath: string) {
    const manifest = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (manifest.v !== 0) {
        throw new Error(`Cannot generate the ${SKILL_NAME} skill: "${filePath}" has the unsupported manifest version ${manifest.v}`);
    }
    return manifest;
}

function referenceFileName(id: string): string {
    return `${id.replace(/--docs$/, "")}.md`;
}

function firstParagraph(text?: string): string | undefined {
    return text
        ?.trim()
        .split(/\n\s*\n/)[0]
        .replace(/\s*\n\s*/g, " ");
}

function formatListItem({ title, fileName, summary }: { title: string; fileName: string; summary?: string }): string {
    const link = `[${title}](references/${fileName})`;
    return summary ? `- ${link}: ${summary}` : `- ${link}`;
}

function formatComponent(component: ComponentManifest): string {
    // `formatComponentManifest` shows only the first stories in full and expects the agent to fetch the others through the MCP server
    const remainingStories = (component.stories ?? [])
        .slice(MAX_STORIES_TO_SHOW)
        .map((story) => formatStoryDocumentation(component, story.name).trim().replace(/^# .*/, `### ${story.name}`));
    if (remainingStories.length === 0) {
        return formatComponentManifest(component);
    }
    return `${formatComponentManifest(component).trim()}\n\n## Code of the Other Stories\n\n${remainingStories.join("\n\n")}\n`;
}

function formatSkill(docs: Doc[], components: ComponentManifest[], requiredDoc: Doc): string {
    const docsList = docs
        .filter((doc) => doc !== requiredDoc)
        .map((doc) => formatListItem({ title: doc.title ?? doc.name, fileName: referenceFileName(doc.id), summary: doc.summary }));
    const componentsList = components.map((component) =>
        formatListItem({ title: component.name, fileName: referenceFileName(component.id), summary: firstParagraph(component.description) }),
    );

    return `---
name: ${SKILL_NAME}
description: ${SKILL_DESCRIPTION}
---

# Building HTML Emails with @dextinity/mail-react

This skill is the usage guide of \`@dextinity/mail-react\` from its Storybook. Email clients support much less than browsers: markup that looks correct in a browser often breaks in Outlook, Gmail or Yahoo Mail.

Before you write or change mail markup, read "Email Client Pitfalls" below and each page that covers the task, for example "Layout Patterns" for columns or "Dark Mode" for colors. Before you use a component, read its page: use only the props and patterns it documents.

## Pages

${docsList.join("\n")}

## Components

${componentsList.join("\n")}

${formatDocsManifest(requiredDoc).trim()}
`;
}

export function generateMailReactSkill({ mailReactDir, skillsDir }: { mailReactDir: string; skillsDir: string }): void {
    const manifests = buildManifests(mailReactDir);
    const docs = Object.values(manifests.docs.docs);
    const components = Object.values(manifests.components.components);

    const requiredDoc = docs.find((doc) => doc.id === REQUIRED_DOCS_ID);
    if (!requiredDoc) {
        throw new Error(`Cannot generate the ${SKILL_NAME} skill: the Storybook has no docs page with the ID "${REQUIRED_DOCS_ID}"`);
    }

    const fileNames = [...docs, ...components].map((entry) => referenceFileName(entry.id));
    const duplicateFileName = fileNames.find((fileName, index) => fileNames.indexOf(fileName) !== index);
    if (duplicateFileName) {
        throw new Error(`Cannot generate the ${SKILL_NAME} skill: two Storybook entries would be written to "references/${duplicateFileName}"`);
    }

    const skillDir = path.join(skillsDir, SKILL_NAME);
    const referencesDir = path.join(skillDir, "references");
    fs.rmSync(skillDir, { recursive: true, force: true });
    fs.mkdirSync(referencesDir, { recursive: true });

    fs.writeFileSync(path.join(skillDir, "SKILL.md"), formatSkill(docs, components, requiredDoc));
    for (const doc of docs) {
        if (doc !== requiredDoc) {
            fs.writeFileSync(path.join(referencesDir, referenceFileName(doc.id)), formatDocsManifest(doc));
        }
    }
    for (const component of components) {
        fs.writeFileSync(path.join(referencesDir, referenceFileName(component.id)), formatComponent(component));
    }

    console.log(`Generated the ${SKILL_NAME} skill from the Storybook of @dextinity/mail-react`); // eslint-disable-line no-console
}
