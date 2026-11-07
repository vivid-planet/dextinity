import { gql, useQuery } from "@apollo/client";
import { useEffect, useLayoutEffect, useRef } from "react";

import { useIFrameBridge } from "../../blocks/iframebridge/useIFrameBridge";
import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { useContentScope } from "../../contentScope/Provider";
import type { GQLBlockPreviewJwtQuery, GQLBlockPreviewJwtQueryVariables } from "./useBlockPreviewBridge.generated";

const blockPreviewJwtQuery = gql`
    query BlockPreviewJwt($scope: JSONObject!, $url: String!, $includeInvisible: Boolean!) {
        blockPreviewJwt(scope: $scope, url: $url, includeInvisible: $includeInvisible)
    }
`;

const jwtRefreshInterval = 1000 * 60 * 60 * 24;

interface UseBlockPreviewBridgeOptions {
    url: string;
    previewState: unknown;
    showOnlyVisible: boolean;
}

/**
 * Sends the preview state, the content scope JWT and the API URL to the block preview `iframe` of the surrounding `IFrameBridgeProvider`
 * once it is ready, and again whenever they change. When `url` changes, the same `iframe` loads the new address and gets the state once
 * the new document is ready.
 */
export function useBlockPreviewBridge({ url, previewState, showOnlyVisible }: UseBlockPreviewBridgeOptions) {
    const iFrameBridge = useIFrameBridge();
    const { scope } = useContentScope();
    const { graphQLApiUrl } = useDextinityConfig();

    const { data, error } = useQuery<GQLBlockPreviewJwtQuery, GQLBlockPreviewJwtQueryVariables>(blockPreviewJwtQuery, {
        fetchPolicy: "network-only",
        variables: { scope, url, includeInvisible: !showOnlyVisible },
        pollInterval: jwtRefreshInterval,
    });
    if (error) {
        throw new Error(error.message);
    }

    const previousUrlRef = useRef(url);
    const { onIFrameNavigate } = iFrameBridge;
    useLayoutEffect(() => {
        if (previousUrlRef.current !== url) {
            previousUrlRef.current = url;
            onIFrameNavigate();
        }
    }, [url, onIFrameNavigate]);

    const jwt = data?.blockPreviewJwt;
    useEffect(() => {
        if (iFrameBridge.iFrameReady && jwt) {
            iFrameBridge.sendBlockState(previewState);
            iFrameBridge.sendContentScopeJwt(jwt);
            iFrameBridge.sendGraphQLApiUrl(graphQLApiUrl);
        }
    }, [iFrameBridge, previewState, graphQLApiUrl, jwt]);

    return iFrameBridge;
}
