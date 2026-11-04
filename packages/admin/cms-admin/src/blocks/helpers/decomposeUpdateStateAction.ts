import type { Dispatch, SetStateAction } from "react";

import { resolveNewState } from "../utils";

type InferedState<T> = T extends Dispatch<SetStateAction<infer S>> ? S : never;

/**
 * Modify a given dispatch action to update only a whitelisted subset of attributes
 * State of dispatch action must be an object
 * In the example below the newly returned dispatch function would only update "bar", values under attribute "foo" are not updated
 *
 * @param action  f.i. pass a Dispatch<SetStateAction> which updates the state {foo: number, bar: string}
 * @param whiteKeys f.i. define ["bar"] as whitelist
 */
export function decomposeUpdateStateAction<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    D extends Dispatch<SetStateAction<any>>,
    S extends InferedState<D>,
    Whitelisted extends keyof S,
>(action: D, whiteKeys: Array<Whitelisted>): Dispatch<SetStateAction<Pick<S, Whitelisted>>> {
    return function decomposedUpdateStateAction(setStateAction: SetStateAction<Pick<S, Whitelisted>>): void {
        action((prevState: S) => {
            const stateWhitelistedToUpdate = Object.entries(prevState).reduce((acc, [key, value]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (whiteKeys.includes(key as any)) {
                    return {
                        ...acc,
                        [key]: value,
                    };
                } else {
                    return acc;
                }
            }, {});

            return {
                ...prevState,
                ...resolveNewState({ prevState: stateWhitelistedToUpdate, setStateAction }),
            };
        });
    };
}
