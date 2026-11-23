import { useScenario } from "../../scenario";
import { PrototypeApp } from "../PrototypeApp";
import { cmsPrototype } from "../prototypes";
import { AssetDetail } from "./assetLibrary/AssetDetail";
import { AssetLibrary } from "./assetLibrary/AssetLibrary";
import { AssetLibraryProvider } from "./assetLibrary/AssetLibraryContext";
import { CmsDashboard } from "./CmsDashboard";
import { cmsNavGroups, findArticle, findPage } from "./cmsData";
import { CmsNews } from "./CmsNews";
import { CmsNewsEditor } from "./CmsNewsEditor";
import { CmsPageEditor } from "./CmsPageEditor";
import { CmsPageTree } from "./CmsPageTree";
import { CmsRedirects } from "./CmsRedirects";
import { CmsSiteProvider } from "./CmsSiteContext";

function renderPage(pageId: string) {
    const [section, id] = pageId.split("/");
    const page = section === "page-tree" && id != null ? findPage(id) : undefined;
    if (page) {
        return <CmsPageEditor page={page} />;
    }
    if (section === "assets" && id != null) {
        return <AssetDetail assetId={id} />;
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
            return <AssetLibrary />;
        case "redirects":
            return <CmsRedirects />;
        default:
            return undefined;
    }
}

/**
 * A classic website CMS: the overview, the page tree with the page editor, structured data (news) with list and form, and the asset
 * library with the detail page of an asset, and the redirects that moving pages creates.
 */
export function CmsPrototype() {
    const scenario = useScenario();
    return (
        <CmsSiteProvider>
            <AssetLibraryProvider key={scenario} scenario={scenario}>
                <PrototypeApp prototype={cmsPrototype} navGroups={cmsNavGroups} renderPage={renderPage} />
            </AssetLibraryProvider>
        </CmsSiteProvider>
    );
}
