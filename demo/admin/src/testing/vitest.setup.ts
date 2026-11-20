import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library unmounts after each test on its own only where the test API is global, which it isn't here.
afterEach(() => {
    cleanup();
});
