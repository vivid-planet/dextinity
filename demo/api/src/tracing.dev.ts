import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: `http://${process.env.JAEGER_HOST}:${process.env.JAEGER_OLTP_PORT}/v1/traces`,
    }),
    metricReaders: [
        new PrometheusExporter(
            {
                port: 9465,
            },
            () => {
                const { endpoint } = PrometheusExporter.DEFAULT_OPTIONS;
                console.log(`prometheus scrape endpoint: http://localhost:9465${endpoint}`);
            },
        ),
    ],
    instrumentations: [
        getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-pg": {
                requestHook: (span, queryInfo) => {
                    span.updateName(`pg: ${queryInfo.query.text.substring(0, 100)}`);
                },
            },
            "@opentelemetry/instrumentation-knex": {
                enabled: false,
            },
            "@opentelemetry/instrumentation-graphql": {
                mergeItems: true,
            },
        }),
    ],
    serviceName: "demo-api",
});

sdk.start();
