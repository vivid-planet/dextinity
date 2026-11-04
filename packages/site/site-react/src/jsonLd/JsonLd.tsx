import type { JSX } from "react";
import type { Thing, WithContext } from "schema-dts";

export type JsonLdProps<T extends Thing> = {
    data: WithContext<T>;
};

// Escape `</` so the JSON payload can never close the surrounding <script> tag.
// This is the standard XSS guard for inline JSON-LD; see
// https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
const escapeJsonForScriptTag = (json: string): string => json.replace(/</g, "\\u003c");

export const JsonLd = <T extends Thing>({ data }: JsonLdProps<T>): JSX.Element => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonForScriptTag(JSON.stringify(data)) }} />
);
