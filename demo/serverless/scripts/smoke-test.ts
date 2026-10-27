/**
 * Exercises the API end-to-end through the typed clients, against the Vite dev server: `pnpm smoke-test [baseUrl]`.
 * Logs in through the Access emulator of the dev server, like a browser.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";

import type { DamRoutes, PageTreeRoutes, PermissionsRoutes } from "@dextinity/serverless/server";
import { hc } from "hono/client";
import sharp, { type Sharp } from "sharp";

import type { ContentScope } from "../shared/content-scope.ts";

const baseUrl = process.argv[2] ?? `http://localhost:${process.env.DEMO_SERVERLESS_PORT}`;
const scope = { domain: "main" };

/** Logs in like a browser and returns the cookie of the Access session */
async function login(userId: string): Promise<string> {
    const response = await fetch(`${baseUrl}/cdn-cgi/access/login`, {
        method: "POST",
        body: new URLSearchParams({ user: userId, redirect_url: "/" }),
        redirect: "manual",
    });
    const cookie = response.headers.get("set-cookie")?.split(";")[0];
    if (!cookie) {
        throw new Error(`Login as user ${userId} failed: ${response.status}`);
    }
    return cookie;
}

const createDamClient = (headers: Record<string, string> = {}) => hc<DamRoutes<typeof ContentScope>>(`${baseUrl}/api/dam`, { headers });
const createPermissionsClient = (headers: Record<string, string> = {}) => hc<PermissionsRoutes>(`${baseUrl}/api`, { headers });
const createPageTreeClient = (headers: Record<string, string> = {}) =>
    hc<PageTreeRoutes<typeof ContentScope>>(`${baseUrl}/api/page-tree`, { headers });

const adminCookie = await login("1");
const api = createDamClient({ cookie: adminCookie });
const editorCookie = await login("2");
const editorApi = createDamClient({ cookie: editorCookie });
const guestCookie = await login("3");
const guestApi = createDamClient({ cookie: guestCookie });
const anonymousApi = createDamClient();

let failures = 0;

async function step(name: string, run: () => Promise<void>): Promise<void> {
    try {
        await run();
        console.info(`✔ ${name}`);
    } catch (error) {
        failures++;
        console.error(`✘ ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function expectEqual<T>(actual: T, expected: T, label = "value"): void {
    // Ignores the order of object keys, which PostgreSQL's jsonb doesn't keep
    if (!isDeepStrictEqual(actual, expected)) {
        throw new Error(`Expected ${label} to be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

interface TypedResponse {
    ok: boolean;
    status: number;
    clone(): { text(): Promise<string> };
}

/** Narrows a response of the typed client to its success types, which excludes e.g. the validation error responses. */
async function expectOk<T extends TypedResponse>(response: T): Promise<Exclude<T, { ok: false }>> {
    if (!response.ok) {
        throw new Error(`${response.status} ${await response.clone().text()}`);
    }
    return response as Exclude<T, { ok: false }>;
}

const { databaseDialect } = await (await fetch(`${baseUrl}/api/status`)).json();
console.info(`Database: ${databaseDialect}\n`);

const imageBytes = await readFile(resolve(import.meta.dirname, "../../api/src/db/fixtures/assets/images/03.jpg"));

await step("get the current user with grants from the rules", async () => {
    const me = await (await expectOk(await createPermissionsClient({ cookie: adminCookie }).me.$get())).json();
    expectEqual(
        [me.name, me.groups, me.grants],
        [
            "Admin",
            ["admins"],
            [
                { permission: "dam", contentScopes: [{ domain: "*" }] },
                { permission: "pageTree", contentScopes: [{ domain: "*" }] },
            ],
        ],
    );
    expectEqual(me.contentScopes, [{ domain: "main" }, { domain: "secondary" }], "contentScopes");
});

await step("get the current user with a stored grant", async () => {
    const me = await (await expectOk(await createPermissionsClient({ cookie: guestCookie }).me.$get())).json();
    expectEqual(me.grants, [{ permission: "dam", contentScopes: [{ domain: "secondary" }] }], "grants");
    expectEqual(me.contentScopes, [{ domain: "secondary" }], "contentScopes");
});

const folderResponse = await expectOk(await api.folders.$post({ json: { name: `Smoke Test ${Date.now()}`, scope } }));
const folder = await folderResponse.json();
console.info(`✔ create folder ${folder.name}`);

const uploadResponse = await expectOk(
    await api.files.upload.$post({
        form: { file: new File([imageBytes], "Smoke Test Image.jpg", { type: "image/jpeg" }), scope: JSON.stringify(scope), folderId: folder.id },
    }),
);
const file = await uploadResponse.json();
console.info(`✔ upload ${file.name} (${file.image?.width}x${file.image?.height}, dominant color ${file.image?.dominantColor})`);

await step("calculate the dimensions and dominant color on upload", async () => {
    const { width, height } = await sharp(imageBytes).metadata();
    expectEqual([file.image?.width, file.image?.height], [width, height], "dimensions");
    expectEqual(/^#[0-9a-f]{6}$/.test(file.image?.dominantColor ?? ""), true, "dominant color is a hex color");
});

await step("list DAM items of the folder", async () => {
    const { nodes, totalCount } = await (await expectOk(await api.items.$get({ query: { ...scope, folderId: folder.id } }))).json();
    expectEqual(totalCount, 1, "totalCount");
    expectEqual(nodes[0].__typename, "DamFile", "__typename");
});

await step("search files case-insensitively", async () => {
    const { totalCount } = await (await expectOk(await api.files.$get({ query: { ...scope, searchText: "SMOKE-TEST-image" } }))).json();
    expectEqual(totalCount >= 1, true, "found");
});

await step("get file with DAM path", async () => {
    const details = await (await expectOk(await api.files[":id"].$get({ param: { id: file.id } }))).json();
    expectEqual(details.damPath, `/${folder.name}`, "damPath");
    expectEqual(details.scope.domain, "main", "scope.domain");
});

await step("update title and alt text", async () => {
    const updated = await (
        await expectOk(await api.files[":id"].$patch({ param: { id: file.id }, json: { title: "Smoke", altText: "Alt" } }))
    ).json();
    expectEqual([updated.title, updated.altText], ["Smoke", "Alt"]);
});

await step("filename is occupied", async () => {
    const [result] = await (
        await expectOk(
            await api.files["filenames-occupied"].$post({ json: { scope, filenames: [{ name: "Smoke Test Image.jpg", folderId: folder.id }] } }),
        )
    ).json();
    expectEqual(result.isOccupied, true, "isOccupied");
});

await step("download the file from its public URL without login", async () => {
    const response = await fetch(`${baseUrl}/api${file.fileUrl}`);
    expectEqual(response.status, 200, "status");
    expectEqual(Buffer.from(await response.arrayBuffer()).equals(imageBytes), true, "bytes match");
    expectEqual(response.headers.get("cache-control"), "max-age=31536000, s-maxage=86400, public", "cache-control");
});

await step("download a range of the file", async () => {
    const response = await fetch(`${baseUrl}/api${file.fileUrl}`, { headers: { Range: "bytes=0-99" } });
    expectEqual(response.status, 206, "status");
    expectEqual((await response.arrayBuffer()).byteLength, 100, "length");
});

await step("reject a file URL with an invalid hash", async () => {
    const response = await fetch(`${baseUrl}/api${file.fileUrl.replace(/files\/[0-9a-f]{40}/, `files/${"0".repeat(40)}`)}`);
    expectEqual(response.status, 400, "status");
});

await step("deliver a smart-cropped image in the format of the Accept header", async () => {
    const url = file.image?.urlTemplate.replace("$resizeWidth", "640").replace("$resizeHeight", "360");
    const response = await fetch(`${baseUrl}/api${url}`, { headers: { Accept: "image/webp,*/*" } });
    expectEqual(response.status, 200, "status");
    expectEqual(response.headers.get("content-type"), "image/webp", "content-type");
    const { format, width, height } = await sharp(await response.arrayBuffer()).metadata();
    expectEqual([format, width, height], ["webp", 640, 360], "format and dimensions");
});

await step("deliver AVIF when accepted", async () => {
    const url = file.image?.urlTemplate.replace("$resizeWidth", "320").replace("$resizeHeight", "180");
    const response = await fetch(`${baseUrl}/api${url}`, { headers: { Accept: "image/avif,image/webp,*/*" } });
    expectEqual(response.headers.get("content-type"), "image/avif", "content-type");
});

await step("deliver the crop area of the image", async () => {
    const cropArea = { focalPoint: "CENTER" as const, width: 50, height: 50, x: 50, y: 50 };
    const updated = await (await expectOk(await api.files[":id"].$patch({ param: { id: file.id }, json: { image: { cropArea } } }))).json();
    if (!updated.image) {
        throw new Error("Not an image");
    }
    const { width, height } = updated.image;
    const resizeHeight = Math.ceil(320 / ((width * 0.5) / (height * 0.5)));
    const url = updated.image.urlTemplate.replace("$resizeWidth", "320").replace("$resizeHeight", String(resizeHeight));
    const response = await fetch(`${baseUrl}/api${url}`, { headers: { Accept: "image/png" } });
    expectEqual(response.status, 200, "status");
    const delivered = Buffer.from(await response.arrayBuffer());
    const { width: deliveredWidth, height: deliveredHeight } = await sharp(delivered).metadata();
    expectEqual([deliveredWidth, deliveredHeight], [320, resizeHeight], "dimensions");

    // The bottom right quarter of the original, scaled to the same size, must look the same
    const thumbnail = (image: Sharp) => image.resize(8, 8, { fit: "fill" }).removeAlpha().raw().toBuffer();
    const expectedPixels = await thumbnail(
        sharp(imageBytes).extract({
            left: Math.round(width / 2),
            top: Math.round(height / 2),
            width: Math.floor(width / 2),
            height: Math.floor(height / 2),
        }),
    );
    const deliveredPixels = await thumbnail(sharp(delivered));
    const difference = expectedPixels.reduce((sum, value, index) => sum + Math.abs(value - deliveredPixels[index]), 0) / expectedPixels.length;
    expectEqual(difference < 20, true, `average pixel difference ${difference.toFixed(1)} below 20`);
});

await step("reject an image size that isn't allowed", async () => {
    const url = file.image?.urlTemplate.replace("$resizeWidth", "641").replace("$resizeHeight", "361");
    expectEqual((await fetch(`${baseUrl}/api${url}`)).status, 400, "status");
});

await step("archive and restore", async () => {
    const [archived] = await (await expectOk(await api.files.archive.$post({ json: { ids: [file.id] } }))).json();
    expectEqual(archived.archived, true, "archived");
    const { totalCount } = await (await expectOk(await api.files.$get({ query: { ...scope, folderId: folder.id } }))).json();
    expectEqual(totalCount, 0, "totalCount without archived");
    const [restored] = await (await expectOk(await api.files.restore.$post({ json: { ids: [file.id] } }))).json();
    expectEqual(restored.archived, false, "archived");
});

await step("create subfolders and get the ancestors recursively", async () => {
    const subfolder = await (await expectOk(await api.folders.$post({ json: { name: "Subfolder", parentId: folder.id, scope } }))).json();
    const subsubfolder = await (await expectOk(await api.folders.$post({ json: { name: "Subsubfolder", parentId: subfolder.id, scope } }))).json();
    const details = await (await expectOk(await api.folders[":id"].$get({ param: { id: subsubfolder.id } }))).json();
    expectEqual(
        details.parents.map(({ name }) => name),
        [folder.name, "Subfolder"],
        "parents",
    );
    const moveResponse = await api.folders[":id"].$patch({ param: { id: folder.id }, json: { parentId: subsubfolder.id } });
    expectEqual(moveResponse.status, 400, "status when moving a folder into its own child");
});

await step("download the folder as zip", async () => {
    const response = await expectOk(await api.folders[":id"].zip.$get({ param: { id: folder.id } }));
    expectEqual(response.headers.get("content-type"), "application/zip", "content-type");
});

await step("get the position of the file in the folder", async () => {
    const { position } = await (
        await expectOk(await api.items.position.$get({ query: { ...scope, folderId: folder.id, id: file.id, type: "File", sortColumnName: "name" } }))
    ).json();
    expectEqual(position, 1, "position (after the subfolder)");
});

await step("allow editors (group role) in their scope only", async () => {
    expectEqual((await editorApi.items.$get({ query: { domain: "main" } })).status, 200, "status in main");
    expectEqual((await editorApi.items.$get({ query: { domain: "secondary" } })).status, 403, "status in secondary");
    expectEqual((await editorApi.files[":id"].$get({ param: { id: file.id } })).status, 200, "status of a file in main");
});

await step("allow guests (stored grant) in their scope only", async () => {
    expectEqual((await guestApi.items.$get({ query: { domain: "secondary" } })).status, 200, "status in secondary");
    expectEqual((await guestApi.items.$get({ query: { domain: "main" } })).status, 403, "status in main");
    expectEqual((await guestApi.files[":id"].$get({ param: { id: file.id } })).status, 403, "status of a file in main");
});

await step("deny anonymous requests", async () => {
    expectEqual((await anonymousApi.items.$get({ query: scope })).status, 401, "status");
});

await step("deny a forged Access JWT", async () => {
    const forged = `${adminCookie.slice(0, -10)}AAAAAAAAAA`;
    expectEqual((await createDamClient({ cookie: forged }).items.$get({ query: scope })).status, 401, "status");
});

await step("reject invalid input", async () => {
    expectEqual((await api.files[":id"].$get({ param: { id: "not-a-uuid" } })).status, 400, "status");
});

await step("delete the folder with its files", async () => {
    const { deleted } = await (await expectOk(await api.folders[":id"].$delete({ param: { id: folder.id } }))).json();
    expectEqual(deleted, true, "deleted");
    expectEqual((await api.files[":id"].$get({ param: { id: file.id } })).status, 404, "status of the deleted file");
    expectEqual((await fetch(`${baseUrl}/api${file.fileUrl}`)).status, 404, "status of the deleted file's URL");
});

// Page tree
const pageTree = createPageTreeClient({ cookie: adminCookie });
const rootSlug = `smoke-${Date.now()}`;
const listPages = async (category: "mainNavigation" | "topMenu" = "mainNavigation") =>
    (await expectOk(await pageTree.nodes.$get({ query: { ...scope, category } }))).json();
const slugAvailability = async (slug: string, parentId?: string) =>
    (await (await expectOk(await pageTree["slug-availability"].$get({ query: { ...scope, slug, ...(parentId ? { parentId } : {}) } }))).json())
        .availability;
const createPage = async (input: { name: string; slug: string; parentId?: string; pos?: number }) =>
    (await expectOk(await pageTree.nodes.$post({ json: { scope, category: "mainNavigation", documentType: "Page", ...input } }))).json();

await step("list the page tree with the home page at /", async () => {
    const home = (await listPages()).find((node) => node.slug === "home");
    expectEqual([home?.path, home?.visibility], ["/", "Published"], "home page");
});

const rootPage = await createPage({ name: "Smoke Test", slug: rootSlug });
const productsPage = await createPage({ name: "Products", slug: "products", parentId: rootPage.id });
const aboutPage = await createPage({ name: "About", slug: "about", parentId: rootPage.id, pos: 1 });
console.info(`✔ create pages ${rootPage.path}, ${productsPage.path} and ${aboutPage.path}`);

const childSlugs = async () => (await listPages()).filter((node) => node.parentId === rootPage.id).map((node) => node.slug);

await step("calculate paths and insert at the requested position", async () => {
    expectEqual([rootPage.path, productsPage.path, rootPage.visibility], [`/${rootSlug}`, `/${rootSlug}/products`, "Unpublished"]);
    expectEqual(await childSlugs(), ["about", "products"], "children in order");
});

await step("check slug availability", async () => {
    expectEqual(await slugAvailability(rootSlug), "Taken", "existing path");
    expectEqual(await slugAvailability("admin"), "Reserved", "reserved path");
    expectEqual(await slugAvailability("home", rootPage.id), "Reserved", "home below a page");
    expectEqual(await slugAvailability("contact", rootPage.id), "Available", "new path");
});

await step("reject a duplicate path and an invalid slug", async () => {
    const duplicate = await pageTree.nodes.$post({
        json: { scope, category: "mainNavigation", documentType: "Page", name: "Dup", slug: "products", parentId: rootPage.id },
    });
    expectEqual(duplicate.status, 400, "status of a duplicate");
    const invalid = await pageTree.nodes.$post({
        json: { scope, category: "mainNavigation", documentType: "Page", name: "Invalid", slug: "-no spaces" },
    });
    expectEqual(invalid.status, 400, "status of an invalid slug");
});

await step("update name and slug", async () => {
    const updated = await (
        await expectOk(await pageTree.nodes[":id"].$patch({ param: { id: productsPage.id }, json: { name: "Shop", slug: "shop" } }))
    ).json();
    expectEqual([updated.name, updated.path], ["Shop", `/${rootSlug}/shop`]);
});

await step("move pages and reject moving a page into itself", async () => {
    await expectOk(await pageTree.nodes.move.$post({ json: { ids: [productsPage.id], parentId: rootPage.id, pos: 1 } }));
    expectEqual(await childSlugs(), ["shop", "about"], "children after moving");
    const intoChild = await pageTree.nodes.move.$post({ json: { ids: [rootPage.id], parentId: aboutPage.id, pos: 1 } });
    expectEqual(intoChild.status, 400, "status of moving into a subpage");
});

await step("archive a page with its subpages and restore it", async () => {
    const setVisibility = async (id: string, visibility: "Published" | "Unpublished" | "Archived") =>
        (await expectOk(await pageTree.nodes[":id"].visibility.$put({ param: { id }, json: { visibility } }))).json();
    await setVisibility(rootPage.id, "Published");
    await setVisibility(rootPage.id, "Archived");
    const archived = (await listPages()).filter((node) => [rootPage.id, aboutPage.id, productsPage.id].includes(node.id));
    expectEqual(
        archived.map((node) => node.visibility),
        ["Archived", "Archived", "Archived"],
        "visibility of the subtree",
    );
    expectEqual(await slugAvailability(rootSlug), "Available", "path of an archived page");
    const restored = await setVisibility(rootPage.id, "Unpublished");
    expectEqual(restored.visibility, "Unpublished", "visibility after restoring");
    await setVisibility(aboutPage.id, "Unpublished");
    await setVisibility(productsPage.id, "Unpublished");
});

await step("move a page with its subpages to another category", async () => {
    await expectOk(await pageTree.nodes[":id"].category.$put({ param: { id: rootPage.id }, json: { category: "topMenu" } }));
    const topMenu = await listPages("topMenu");
    expectEqual(topMenu.filter((node) => [rootPage.id, aboutPage.id, productsPage.id].includes(node.id)).length, 3, "pages in the top menu");
    expectEqual(
        (await listPages()).some((node) => node.id === rootPage.id),
        false,
        "page left the main navigation",
    );
});

await step("allow the page tree for editors (group role) and deny it for guests", async () => {
    expectEqual((await createPageTreeClient({ cookie: editorCookie }).nodes.$get({ query: scope })).status, 200, "status for editors");
    expectEqual(
        (await createPageTreeClient({ cookie: guestCookie }).nodes.$get({ query: { domain: "secondary" } })).status,
        403,
        "status for guests",
    );
});

// Documents of the page tree
const documentRoute = pageTree.nodes[":id"].document;
const richText = (text: string, link?: object) => ({
    draftContent: {
        blocks: [
            {
                key: "a1b2c",
                type: "unstyled",
                text,
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: link ? [{ key: 0, offset: 0, length: text.length }] : [],
            },
        ],
        entityMap: link ? { 0: { type: "LINK", mutability: "MUTABLE", data: link } } : {},
    },
});
const externalLink = (targetUrl: string) => ({
    attachedBlocks: [{ type: "external", props: { targetUrl, openInNewWindow: false, noFollow: false } }],
    activeType: "external",
});
const imageFileId = crypto.randomUUID();
const pageDocument = (text: string, link = externalLink("https://www.dextinity.com")) => ({
    content: {
        blocks: [
            { key: "text", visible: true, type: "richtext", props: { richText: richText(text, link), textAlignment: "left" } },
            {
                key: "image",
                visible: true,
                type: "image",
                props: {
                    attachedBlocks: [{ type: "pixelImage", props: { damFileId: imageFileId, cropArea: { focalPoint: "SMART" } } }],
                    activeType: "pixelImage",
                },
            },
        ],
    },
    seo: { noIndex: false, priority: "0_5", changeFrequency: "weekly", alternativeLinks: [], openGraphImage: { visible: false } },
    stage: { blocks: [] },
});

await step("load a page without a document", async () => {
    const { type, data, updatedAt } = await (await expectOk(await documentRoute.$get({ param: { id: aboutPage.id } }))).json();
    expectEqual([type, data, updatedAt], ["Page", null, null]);
});

let savedUpdatedAt = "";

await step("save and load the document of a page", async () => {
    const saved = await (
        await expectOk(await documentRoute.$put({ param: { id: aboutPage.id }, json: { data: pageDocument("Hello"), lastUpdatedAt: null } }))
    ).json();
    savedUpdatedAt = saved.updatedAt ?? "";
    const loaded = await (await expectOk(await documentRoute.$get({ param: { id: aboutPage.id } }))).json();
    expectEqual(loaded.data, pageDocument("Hello"), "loaded document");
    expectEqual(loaded.updatedAt, savedUpdatedAt, "updatedAt");
});

await step("reject an invalid document instead of dropping what the schema doesn't know", async () => {
    const save = (data: Record<string, unknown>) => documentRoute.$put({ param: { id: aboutPage.id }, json: { data } });
    const valid = pageDocument("Hello");
    const unknownBlock = { ...valid, content: { blocks: [{ key: "x", visible: true, type: "newsList", props: {} }] } };
    const unknownField = { ...valid, seo: { ...valid.seo, keywords: "smoke" } };
    expectEqual((await save(unknownBlock)).status, 422, "status of an unknown block type");
    expectEqual((await save(unknownField)).status, 422, "status of an unknown field");
    expectEqual((await save(pageDocument("Hello", externalLink("javascript:alert(1)")))).status, 422, "status of a javascript: link");
    expectEqual((await save({ content: valid.content })).status, 422, "status of a missing root block");
});

await step("reject saving over a document that changed in the meantime", async () => {
    const save = (lastUpdatedAt: string | null) =>
        documentRoute.$put({ param: { id: aboutPage.id }, json: { data: pageDocument("Update"), lastUpdatedAt } });
    const first = await (await expectOk(await save(savedUpdatedAt))).json();
    expectEqual((await save(savedUpdatedAt)).status, 409, "status of saving with an outdated updatedAt");
    expectEqual((await save(null)).status, 409, "status of saving as a new document");
    await expectOk(await save(first.updatedAt));
});

await step("keep the document of the previous document type", async () => {
    const setDocumentType = async (documentType: "Page" | "Link") =>
        expectOk(await pageTree.nodes[":id"].$patch({ param: { id: aboutPage.id }, json: { documentType } }));
    await setDocumentType("Link");
    const link = await (await expectOk(await documentRoute.$get({ param: { id: aboutPage.id } }))).json();
    expectEqual([link.type, link.data], ["Link", null], "document of the link");
    await expectOk(
        await documentRoute.$put({
            param: { id: aboutPage.id },
            json: { data: { content: { ...externalLink("mailto:office@example.com"), title: "Mail" } } },
        }),
    );
    await setDocumentType("Page");
    const page = await (await expectOk(await documentRoute.$get({ param: { id: aboutPage.id } }))).json();
    expectEqual([page.type, page.data], ["Page", pageDocument("Update")], "document of the page");
});

await step("keep the home page and delete a page with its subpages", async () => {
    const home = (await listPages()).find((node) => node.slug === "home");
    expectEqual((await pageTree.nodes[":id"].$delete({ param: { id: home?.id ?? "" } })).status, 400, "status of deleting the home page");
    await expectOk(await pageTree.nodes[":id"].$delete({ param: { id: rootPage.id } }));
    expectEqual((await pageTree.nodes[":id"].$get({ param: { id: aboutPage.id } })).status, 404, "status of a deleted subpage");
    expectEqual((await documentRoute.$get({ param: { id: aboutPage.id } })).status, 404, "status of the document of a deleted subpage");
});

if (failures > 0) {
    console.error(`\n${failures} step(s) failed`);
    process.exit(1);
}
console.info("\nAll steps passed");
