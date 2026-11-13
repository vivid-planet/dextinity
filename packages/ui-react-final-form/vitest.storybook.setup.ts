// Story tests check behavior, not motion. Without transitions, Base UI popups, toasts, and panels reach their final state
// immediately, so assertions don't race enter and exit animations on slower runners.
const style = document.createElement("style");
style.textContent = `
    *, *::before, *::after {
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
    }
`;
document.head.append(style);
