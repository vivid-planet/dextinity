type Faker = (typeof import("@faker-js/faker"))["faker"];

let instance: Faker | undefined;

function getFaker(): Faker {
    if (!instance) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        instance = (require("@faker-js/faker") as typeof import("@faker-js/faker")).faker;
    }
    return instance;
}

// @faker-js/faker is heavy (~33 MB resident) and only needed when fixtures are generated via
// the CLI. Importing it eagerly in the ~40 fixture services pulled it into memory on every API
// startup. This proxy defers the actual `require` until the first property access, so importing
// a fixture service (e.g. during normal API startup) no longer loads faker.
export const faker: Faker = new Proxy({} as Faker, {
    get(_target, property) {
        const value = getFaker()[property as keyof Faker];
        // Bind top-level methods (e.g. faker.seed()) to the real instance so their `this` is correct.
        // Sub-namespaces (faker.person, faker.image, …) are objects and are returned as-is.
        return typeof value === "function" ? value.bind(getFaker()) : value;
    },
});
