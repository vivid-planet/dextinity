import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { IncomingMessage } from "http";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: `http://${process.env.JAEGER_HOST}:${process.env.JAEGER_OLTP_PORT}/v1/traces`,
    }),
    metricReaders: [
        new PrometheusExporter({}, () => {
            const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;
            // eslint-disable-next-line no-console
            console.log(`prometheus scrape endpoint: http://localhost:${port}${endpoint}`);
        }),
    ],
    instrumentations: [
        getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-http": {
                requestHook: (span, request) => {
                    if (request instanceof IncomingMessage && request.url) {
                        span.updateName(`HTTP ${request.method} ${request.url}`);
                    }
                },
            },
        }),
    ],
    serviceName: "demo-site",
});

sdk.start();
