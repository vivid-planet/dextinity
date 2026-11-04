/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AnonymousBlockInterface, BlockAdminComponent, BlockMethods } from "../../types";
import { createSettingsAnonymousBlock } from "./createSettingsBlock";

interface Options<State extends Record<string, any>> {
    defaultValues: State;
    AdminComponent: BlockAdminComponent<State>;
    definesOwnPadding?: boolean;
    extractTextContents?: BlockMethods["extractTextContents"];
}

export function createCompositeBlockFields<State extends Record<string, any>>({
    defaultValues,
    AdminComponent,
    definesOwnPadding,
    extractTextContents,
}: Options<State>): [AnonymousBlockInterface<State, State, State>, { flatten: true }] {
    return [
        createSettingsAnonymousBlock<State>({
            defaultValues,
            AdminComponent,
            definesOwnPadding,
            extractTextContents,
        }),
        { flatten: true },
    ];
}
