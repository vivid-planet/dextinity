import { getRequestContext } from "@dextinity/site-react-router/server";

import { testContext } from "../requestContext";

export function ServerComponent() {
    const { sitePreview } = getRequestContext().get(testContext);
    return <p id="preview-info">{sitePreview ? `Preview of ${JSON.stringify(sitePreview.scope)}` : "No preview"}</p>;
}
