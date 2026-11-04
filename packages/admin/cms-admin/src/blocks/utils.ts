import type { SetStateAction } from "react";

interface ResolveNewStateOptions<S> {
    prevState: S;
    setStateAction: SetStateAction<S>;
}
export function resolveNewState<S>({ prevState, setStateAction }: ResolveNewStateOptions<S>): S {
    // type guard
    function actionIsFunction(action: SetStateAction<S>): action is (prevState: S) => S {
        return typeof action === "function";
    }

    if (actionIsFunction(setStateAction)) {
        return setStateAction(prevState); // it's a function
    } else {
        return setStateAction; // it's a state object
    }
}
