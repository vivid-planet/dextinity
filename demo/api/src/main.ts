if (process.env.TRACING == "production") {
    await import("./tracing.production.js");
} else if (process.env.TRACING == "dev") {
    await import("./tracing.dev.js");
}

// Imported dynamically so that the application's modules are loaded after tracing has been set up and can be instrumented.
await import("./bootstrap.js");
