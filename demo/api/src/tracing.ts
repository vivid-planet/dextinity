if (process.env.TRACING == "production") {
    await import("./tracing.production.js");
} else if (process.env.TRACING == "dev") {
    await import("./tracing.dev.js");
}
