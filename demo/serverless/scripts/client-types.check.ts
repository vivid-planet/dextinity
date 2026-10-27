/**
 * Type-level checks of the typed client, verified by `tsc` (lint:tsc). Never executed.
 */
import type { DamRoutes } from "@dextinity/serverless/server";
import { hc } from "hono/client";

import type { ContentScope } from "../shared/content-scope.ts";

const dam = hc<DamRoutes<typeof ContentScope>>("http://localhost/api/dam");

export async function checks() {
    // @ts-expect-error The scope dimension "domain" of the demo's ContentScope is required
    await dam.items.$get({ query: { folderId: "…" } });

    // @ts-expect-error Unknown sort column
    await dam.files.$get({ query: { domain: "main", sortColumnName: "unknown" } });

    const response = await dam.files[":id"].$get({ param: { id: "…" } });
    if (response.ok) {
        const file = await response.json();
        const domain: string = file.scope.domain;
        const urlTemplate: string | undefined = file.image?.urlTemplate;
        // @ts-expect-error The demo's ContentScope has no language
        const language: string = file.scope.language;
        return { domain, urlTemplate, language };
    }
}
