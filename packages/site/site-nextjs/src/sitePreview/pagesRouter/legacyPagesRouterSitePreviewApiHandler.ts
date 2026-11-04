import type { NextApiRequest, NextApiResponse } from "next";

import { type SitePreviewJwtPayload, verifyJwt } from "../previewUtils";

async function legacyPagesRouterSitePreviewApiHandler(req: NextApiRequest, res: NextApiResponse) {
    const params = req.query;
    const jwt = params.jwt;

    if (typeof jwt !== "string") {
        return res.status(400).json({ error: "JWT-Parameter is missing." });
    }

    const data = await verifyJwt<SitePreviewJwtPayload>(jwt);
    if (!data) {
        return res.status(400).json({ error: "JWT-validation failed." });
    }

    if (!data.path.startsWith("/") || data.path.startsWith("//")) {
        return res.status(400).json({ error: `Redirect to ${data.path} disallowed: only relative paths are valid.` });
    }

    res.setPreviewData(data);
    res.redirect(data.path);
}

export { legacyPagesRouterSitePreviewApiHandler };
