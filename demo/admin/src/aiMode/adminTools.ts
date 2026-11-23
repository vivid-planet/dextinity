import type { AiModeTool } from "@dextinity/cms-admin";

import type { AdminPage } from "./adminPages";

export const createAdminTools = ({
    pages,
    navigate,
    scopeUrl,
}: {
    pages: AdminPage[];
    navigate: (path: string) => void;
    /** The URL prefix of the current content scope, e.g. "/main/en". */
    scopeUrl: string;
}): AiModeTool[] => [
    {
        name: "open_admin_page",
        description:
            "Open a page of the admin's main navigation in the current content scope, e.g. when the user asks to go to the assets or the redirects, or for something only that page offers. " +
            "Each page offers its own tools: once it is open, the context's 'toolsets' list them. Unsaved changes of the page that is open are not lost silently: the user is asked whether to discard them, and may stay on it.",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: `The path of the page, one of these, each with the page's label in the navigation:\n${pages.map(({ path, label }) => `${path}: ${label}`).join("\n")}`,
                },
            },
            required: ["path"],
        },
        // Navigating changes no data, so the chat runs it without asking; see "Approval" in the README.
        readOnlyHint: true,
        handler: (args) => {
            const path = String(args.path ?? "");
            const page = pages.find((candidate) => candidate.path === path);
            if (!page) {
                throw new Error(`"${path}" is no page the user can open. It must be one of: ${pages.map((candidate) => candidate.path).join(", ")}.`);
            }

            navigate(`${scopeUrl}${page.path}`);
            return `Asked the admin to open "${page.label}". If the page that was open has unsaved changes, the user first decides whether to discard them and may stay on it, so check the context's 'toolsets' for which page is open before you use its tools.`;
        },
    },
];
