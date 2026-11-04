import type { AnonymousBlockInterface, BlockAdminComponent, BlockMethods } from "../../types";
import { createSettingsAnonymousBlock } from "./createSettingsBlock";

interface Options<State> {
    defaultValue: State;
    AdminComponent: BlockAdminComponent<State>;
    definesOwnPadding?: boolean;
    extractTextContents?: BlockMethods["extractTextContents"];
    translateContent?: BlockMethods["translateContent"];
}

export function createCompositeBlockField<State>({
    defaultValue,
    AdminComponent,
    definesOwnPadding,
    extractTextContents,
    translateContent,
}: Options<State>): [AnonymousBlockInterface<State, State, State, State>, { flatten: false }] {
    return [
        createSettingsAnonymousBlock<State>({
            defaultValues: defaultValue,
            AdminComponent,
            definesOwnPadding,
            extractTextContents,
            translateContent,
        }),

        { flatten: false },
    ];
}
