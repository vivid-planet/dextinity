import { delay, HttpResponse } from "msw";

import { findContentMatches } from "../../src/fullTextSearch/__stories__/shared/pageContents";
import { graphqlApi } from "./graphqlApi";

interface SearchResult {
    id: string;
    entityName: string;
    name: string;
    secondaryInformation: string;
}

const mockSearchResults: SearchResult[] = [
    { id: "p1", entityName: "Page", name: "Über uns", secondaryInformation: "/de/unternehmen/ueber-uns" },
    { id: "p2", entityName: "Page", name: "Karriere", secondaryInformation: "/de/unternehmen/karriere" },
    { id: "p3", entityName: "Page", name: "Offene Stellen", secondaryInformation: "/de/unternehmen/karriere/offene-stellen" },
    { id: "p4", entityName: "Page", name: "Kontakt", secondaryInformation: "/de/kontakt" },
    { id: "p5", entityName: "Page", name: "Produkte", secondaryInformation: "/de/produkte" },
    { id: "p6", entityName: "Page", name: "Elektromobilität", secondaryInformation: "/de/produkte/elektromobilitaet" },
    { id: "p7", entityName: "Page", name: "Impressum", secondaryInformation: "/de/impressum" },
    { id: "p8", entityName: "Page", name: "Datenschutz", secondaryInformation: "/de/datenschutz" },
    { id: "p9", entityName: "Page", name: "Unternehmensgeschichte", secondaryInformation: "/de/unternehmen/geschichte" },
    { id: "p10", entityName: "Page", name: "Standorte", secondaryInformation: "/de/unternehmen/standorte" },
    { id: "n1", entityName: "News", name: "Neuer Standort in Graz eröffnet", secondaryInformation: "Unternehmen · 12.03.2026" },
    { id: "n2", entityName: "News", name: "Produktlaunch: E-Bike Serie 2026", secondaryInformation: "Produkte · 02.02.2026" },
    { id: "n3", entityName: "News", name: "Karrieretag im Mai", secondaryInformation: "Karriere · 18.04.2026" },
    { id: "n4", entityName: "News", name: "Unternehmen erhält Nachhaltigkeitspreis", secondaryInformation: "Unternehmen · 07.10.2026" },
    { id: "n5", entityName: "News", name: "Rückblick auf das Jahr 2025", secondaryInformation: "Unternehmen · 30.12.2025" },
    { id: "pr1", entityName: "Product", name: "E-Bike City 500", secondaryInformation: "Elektromobilität · Art.-Nr. 10045" },
    { id: "pr2", entityName: "Product", name: "E-Bike Trekking 700", secondaryInformation: "Elektromobilität · Art.-Nr. 10046" },
    { id: "pr3", entityName: "Product", name: "Ladestation Home", secondaryInformation: "Zubehör · Art.-Nr. 20011" },
    { id: "pr4", entityName: "Product", name: "Fahrradhelm Urban", secondaryInformation: "Zubehör · Art.-Nr. 20034" },
    { id: "d1", entityName: "DamFile", name: "karriere-teamfoto.jpg", secondaryInformation: "/Unternehmen/Karriere" },
    { id: "d2", entityName: "DamFile", name: "unternehmen-logo.svg", secondaryInformation: "/Brand" },
    { id: "d3", entityName: "DamFile", name: "e-bike-city-500-front.png", secondaryInformation: "/Produkte/E-Bikes" },
    { id: "d4", entityName: "DamFile", name: "standorte-karte.pdf", secondaryInformation: "/Unternehmen/Downloads" },
    { id: "d5", entityName: "DamFile", name: "datenschutzerklaerung-2026.pdf", secondaryInformation: "/Rechtliches" },
    { id: "r1", entityName: "Redirect", name: "/jobs", secondaryInformation: "→ /de/unternehmen/karriere" },
    { id: "r2", entityName: "Redirect", name: "/about", secondaryInformation: "→ /de/unternehmen/ueber-uns" },
    { id: "r3", entityName: "Redirect", name: "/ebike", secondaryInformation: "→ /de/produkte/elektromobilitaet" },
];

function matchesSearch(result: SearchResult, search: string) {
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    const haystack = `${result.name} ${result.secondaryInformation ?? ""}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
}

export const fullTextSearchPrototypeHandler = graphqlApi.query<
    { myFullTextSearch: { nodes: SearchResult[]; totalCount: number } },
    { search: string; limit?: number; offset?: number }
>("FullTextSearchPrototype", async ({ variables }) => {
    await delay(350);
    const titleMatches = mockSearchResults.filter((result) => matchesSearch(result, variables.search));
    const contentMatches = mockSearchResults.filter(
        (result) => !titleMatches.includes(result) && findContentMatches(result.id, variables.search).length > 0,
    );
    const matches = [...titleMatches, ...contentMatches];
    const offset = variables.offset ?? 0;
    const limit = variables.limit ?? 10;
    return HttpResponse.json({
        data: {
            myFullTextSearch: {
                nodes: matches.slice(offset, offset + limit).map((node) => ({ ...node, __typename: "EntityInfo" })),
                totalCount: matches.length,
            },
        },
    });
});
