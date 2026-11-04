import { getRequestContext, getVisibility } from "@dextinity/site-react-router/server";

// Server components read the context of the request, e.g. the preview, without a loader
export async function ServerComponent() {
    await Promise.resolve();
    return <h1>Visibility of the request: {getVisibility(getRequestContext())}</h1>;
}
