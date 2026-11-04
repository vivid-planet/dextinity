// Workaround for https://github.com/jsdom/cssstyle/issues/247
// cssstyle crashes when resolving border shorthands containing var() or CSS global keywords.
// This suppresses the specific TypeError until the upstream fix lands (see also https://github.com/jsdom/cssstyle/issues/319).
// TODO: Remove this once fixed in cssstyle
// Note: We must patch the prototype via a DOM element because jsdom bundles its own copy of
// CSSStyleDeclaration, which is a different class from the one exported by `cssstyle`.
const el = document.createElement("div");
const CSSStyleDeclaration = Object.getPrototypeOf(el.style).constructor;
const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
CSSStyleDeclaration.prototype.setProperty = function (...args: Parameters<CSSStyleDeclaration["setProperty"]>) {
    try {
        return originalSetProperty.apply(this, args);
    } catch (error) {
        if (error instanceof TypeError && error.message.includes("Cannot create property 'border-width' on string")) {
            return;
        }
        throw error;
    }
};
