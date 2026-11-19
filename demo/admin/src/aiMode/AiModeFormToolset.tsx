import { useForm, useFormState } from "react-final-form";

import { useAiModeToolset } from "./AiModeToolsets";
import { type AiModeFormField, createFormTools } from "./formTools";

type AiModeFormToolsetProps = {
    /** Names the toolset and the tools, in snake case, e.g. "news" or "product_variant". */
    entityName: string;
    /** Names the entity for the agent, e.g. "news article". */
    entityLabel: string;
    /** The ID of the entity being edited; none for the form that creates one. */
    id?: string;
    fields: AiModeFormField[];
};

/**
 * Lets the AI Mode read and fill in the form it is rendered in, a `FinalForm`. A component rather than a hook, so that
 * it can read the form, and so that only it re-renders when the form's `dirty` changes.
 */
export function AiModeFormToolset({ entityName, entityLabel, id, fields }: AiModeFormToolsetProps) {
    const form = useForm<Record<string, unknown>>();
    const { dirty } = useFormState({ subscription: { dirty: true } });

    useAiModeToolset({
        id: `${entityName}_form`,
        description: id
            ? `The form of the ${entityLabel} with the ID ${id}.`
            : `The form for a new ${entityLabel}, which is created when the user saves it.`,
        context: { id: id ?? null, hasChanges: dirty },
        tools: createFormTools({ entityName, entityLabel, fields, form }),
    });

    return null;
}
