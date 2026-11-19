import { PrototypeApp } from "../PrototypeApp";
import { cmsPrototype } from "../prototypes";
import { CmsAssets } from "./CmsAssets";
import { CmsDashboard } from "./CmsDashboard";
import { cmsNavGroups, findArticle, findPage } from "./cmsData";
import { CmsNews } from "./CmsNews";
import { CmsNewsEditor } from "./CmsNewsEditor";
import { CmsPageEditor } from "./CmsPageEditor";
import { CmsPageTree } from "./CmsPageTree";

function renderPage(pageId: string) {
    const [section, id] = pageId.split("/");
    const page = section === "page-tree" && id != null ? findPage(id) : undefined;
    if (page) {
        return <CmsPageEditor page={page} />;
    }
    if (section === "news" && id != null) {
        return <CmsNewsEditor article={findArticle(id)} />;
    }
    switch (pageId) {
        case "dashboard":
            return <CmsDashboard />;
        case "page-tree":
            return <CmsPageTree />;
        case "news":
            return <CmsNews />;
        case "assets":
            return <CmsAssets />;
        default:
            return undefined;
    }
}

/**
 * A classic website CMS: the overview, the page tree with the page editor, structured data (news) with list and form, and the assets.
 */
export function CmsPrototype() {
    return <PrototypeApp prototype={cmsPrototype} navGroups={cmsNavGroups} renderPage={renderPage} />;
}
