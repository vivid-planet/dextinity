import { getRequestContext } from "@dextinity/site-react-router/server";

import { testContext } from "../requestContext";

async function RequestId() {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return <p id="request-id">Request {getRequestContext().get(testContext).requestId}</p>;
}

export function ServerComponent() {
    return <RequestId />;
}
