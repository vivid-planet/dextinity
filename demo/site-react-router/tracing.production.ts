import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { RuntimeNodeInstrumentation } from "@opentelemetry/instrumentation-runtime-node";
import { NodeSDK } from "@opentelemetry/sdk-node";

//diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
    metricReaders: [
        new PrometheusExporter({}, () => {
            const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;
            // eslint-disable-next-line no-console
            console.log(`prometheus scrape endpoint: http://localhost:${port}${endpoint}`);
        }),
    ],
    instrumentations: [
        new RuntimeNodeInstrumentation({
            monitoringPrecision: 5000,
        }),
    ],
    serviceName: "demo-site",
});

sdk.start();
