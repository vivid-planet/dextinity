import type { FilterEditorStateBeforeUpdateFn } from "../Rte";

const composeFilterEditorFns: (fns: FilterEditorStateBeforeUpdateFn[]) => FilterEditorStateBeforeUpdateFn = (fns) => (newState, ctx) => {
    return fns.reduce((nextState, filterFn) => filterFn(nextState, ctx), newState);
};

export default composeFilterEditorFns;
