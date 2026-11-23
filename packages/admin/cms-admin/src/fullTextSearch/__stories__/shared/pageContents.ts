/**
 * Mock block content of pages. The full-text search API doesn't return where in a page's content a search term was
 * found yet. It would need to return the matched block (its `jsonPath`) and a text snippet around the match.
 */
interface PageBlock {
    blockId: string;
    location: string[];
    text: string;
}

export interface ContentMatch {
    blockId: string;
    location: string[];
    snippet: string;
}

const pageBlocks: Record<string, PageBlock[]> = {
    p1: [
        {
            blockId: "p1-stage",
            location: ["Stage", "Heading"],
            text: "Seit 1958 entwickeln wir Mobilität, die bewegt – nachhaltig, sicher und mit Leidenschaft für jedes Detail.",
        },
        {
            blockId: "p1-text",
            location: ["Content", "Text"],
            text: "Unser Familienunternehmen beschäftigt heute über 400 Mitarbeitende an fünf Standorten. Nachhaltigkeit ist für uns kein Trend, sondern seit Jahrzehnten Teil unserer Produktion: Wir fertigen mit Ökostrom und recyceln über 90 Prozent unserer Materialien.",
        },
    ],
    p2: [
        {
            blockId: "p2-text",
            location: ["Content", "Text"],
            text: "Wir suchen Menschen, die mit uns die Mobilität von morgen gestalten. Neben einem sicheren Arbeitsplatz bieten wir flexible Arbeitszeiten, ein Dienstrad mit fünf Jahren Garantie und Weiterbildung nach Wahl.",
        },
    ],
    p4: [
        {
            blockId: "p4-faq-1",
            location: ["Content", "Accordion", "Wie lange gilt die Garantie?", "Text"],
            text: "Auf alle Rahmen geben wir zehn Jahre Garantie, auf Motor und Akku zwei Jahre. Die Garantie gilt ab dem Kaufdatum und ist an das Fahrrad gebunden, nicht an die Käuferin oder den Käufer.",
        },
        {
            blockId: "p4-faq-2",
            location: ["Content", "Accordion", "Wie erreiche ich den Kundenservice?", "Text"],
            text: "Unser Kundenservice ist Montag bis Freitag von 8 bis 18 Uhr telefonisch erreichbar. Für Fragen zur Garantie halten Sie bitte Ihre Rechnung bereit.",
        },
    ],
    p6: [
        {
            blockId: "p6-teaser",
            location: ["Content", "Teaser", "E-Bike City 500"],
            text: "Das E-Bike City 500 bringt Sie leise und nachhaltig durch die Stadt. Mit 80 km Reichweite und fünf Jahren Garantie auf den Akku.",
        },
        {
            blockId: "p6-text",
            location: ["Content", "Text"],
            text: "Elektromobilität ist für uns der wichtigste Schritt zu nachhaltiger Mobilität in der Stadt. Alle Modelle laden an einer normalen Steckdose in unter vier Stunden.",
        },
    ],
    p8: [
        {
            blockId: "p8-text",
            location: ["Content", "Text"],
            text: "Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie zur Abwicklung von Garantie- und Serviceanfragen erforderlich ist.",
        },
    ],
    p9: [
        {
            blockId: "p9-timeline",
            location: ["Content", "Timeline", "1958"],
            text: "Gründung der Werkstatt in Graz. Die ersten Fahrräder entstehen in Handarbeit, jedes mit einer lebenslangen Garantie auf den Rahmen.",
        },
        {
            blockId: "p9-timeline-2",
            location: ["Content", "Timeline", "2012"],
            text: "Umstellung der gesamten Produktion auf Ökostrom – ein erster großer Schritt in Richtung nachhaltiger Fertigung.",
        },
    ],
};

const snippetRadius = 60;

function createSnippet(text: string, matchIndex: number, matchLength: number) {
    let start = Math.max(0, matchIndex - snippetRadius);
    let end = Math.min(text.length, matchIndex + matchLength + snippetRadius);
    if (start > 0) {
        start = text.indexOf(" ", start) + 1;
    }
    if (end < text.length) {
        const lastSpace = text.lastIndexOf(" ", end);
        end = lastSpace > matchIndex + matchLength ? lastSpace : end;
    }
    return `${start > 0 ? "… " : ""}${text.slice(start, end)}${end < text.length ? " …" : ""}`;
}

export function findContentMatches(pageId: string, search: string): ContentMatch[] {
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
        return [];
    }
    const matches: ContentMatch[] = [];
    for (const block of pageBlocks[pageId] ?? []) {
        const lowerText = block.text.toLowerCase();
        if (terms.every((term) => lowerText.includes(term))) {
            const matchIndex = lowerText.indexOf(terms[0]);
            matches.push({ blockId: block.blockId, location: block.location, snippet: createSnippet(block.text, matchIndex, terms[0].length) });
        }
    }
    return matches;
}
