import type { DocumentNode } from "@apollo/client";

/** A fragment on `BrevoContact` with further attributes of the project, and its name to spread it. */
export interface AdditionalAttributesFragment {
    name: string;
    fragment: DocumentNode;
}
