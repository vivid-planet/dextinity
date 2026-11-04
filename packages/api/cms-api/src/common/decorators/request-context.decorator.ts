import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { IncomingHttpHeaders } from "http";

import { BlockVisibility } from "../../blocks/types";
import { PageTreeNodeVisibility } from "../../page-tree/types";
import { getRequestFromExecutionContext } from "./utils";

export interface RequestContextInterface {
    includeInvisiblePages?: Array<PageTreeNodeVisibility.Archived | PageTreeNodeVisibility.Unpublished>;
    includeInvisibleBlocks?: boolean;
    previewDamUrls: boolean;
}

export const getRequestContextHeadersFromRequest = (request: { headers: IncomingHttpHeaders }): RequestContextInterface => {
    const { includeInvisiblePages, includeInvisibleBlocks } = parseIncludeInvisibleHeader(request.headers["x-include-invisible-content"]);

    return {
        includeInvisiblePages,
        includeInvisibleBlocks,
        previewDamUrls: !!request.headers["x-preview-dam-urls"],
    };
};

export const RequestContext = createParamDecorator((data: unknown, ctx: ExecutionContext): RequestContextInterface => {
    const request = getRequestFromExecutionContext(ctx);

    return getRequestContextHeadersFromRequest(request);
});

function parseIncludeInvisibleHeader(
    rawHeader: undefined | string | string[],
): Pick<RequestContextInterface, "includeInvisiblePages" | "includeInvisibleBlocks"> {
    if (!rawHeader) {
        return {};
    }

    let includeInvisiblePages: Array<PageTreeNodeVisibility.Archived | PageTreeNodeVisibility.Unpublished> | undefined = undefined;
    let includeInvisibleBlocks: boolean | undefined = undefined;

    const header = !Array.isArray(rawHeader) ? rawHeader.split(",").map((c) => c.trim()) : rawHeader;

    header.forEach((entry) => {
        switch (entry) {
            case `Pages:${PageTreeNodeVisibility.Archived}`:
                if (includeInvisiblePages === undefined) {
                    includeInvisiblePages = [PageTreeNodeVisibility.Archived];
                } else {
                    includeInvisiblePages.push(PageTreeNodeVisibility.Archived);
                }
                break;

            case `Pages:${PageTreeNodeVisibility.Unpublished}`:
                if (includeInvisiblePages === undefined) {
                    includeInvisiblePages = [PageTreeNodeVisibility.Unpublished];
                } else {
                    includeInvisiblePages.push(PageTreeNodeVisibility.Unpublished);
                }
                break;

            case `Blocks:${BlockVisibility.Invisible}`:
                includeInvisibleBlocks = true;
                break;

            // Legacy header
            case PageTreeNodeVisibility.Archived:
            case PageTreeNodeVisibility.Unpublished:
                console.warn(`Using legacy header "${entry}" in "x-include-invisible-content". Please update header to "Pages:${entry}"`);

                if (includeInvisiblePages === undefined) {
                    includeInvisiblePages = [entry];
                } else {
                    includeInvisiblePages.push(entry);
                }
                includeInvisibleBlocks = true;
                break;
        }
    });

    return { includeInvisiblePages, includeInvisibleBlocks };
}
