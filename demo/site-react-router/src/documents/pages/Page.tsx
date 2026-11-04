import { JsonLd } from "@dextinity/site-react";
import { Breadcrumbs } from "@src/common/components/breadcrumbs/Breadcrumbs";
import type { Thing, WithContext } from "schema-dts";

import { PageContentBlock } from "./blocks/PageContentBlock";
import { StageBlock } from "./blocks/StageBlock";
import type { PageData } from "./loadPage.server";

export function Page({ structuredData, pageTreeNode, scope, content, stage }: Omit<PageData, "metadata">) {
    return (
        <>
            {structuredData && <JsonLd<Thing> data={structuredData as WithContext<Thing>} />}
            <Breadcrumbs {...pageTreeNode} scope={scope} />
            {/* ID is used for skip link */}
            <main id="mainContent">
                <StageBlock data={stage} />
                <PageContentBlock data={content} />
            </main>
        </>
    );
}
