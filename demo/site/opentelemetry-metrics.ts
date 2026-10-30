import {
    Attributes,
    Counter,
    Histogram,
    MetricOptions,
    metrics,
    ObservableCounter,
    ObservableGauge,
    ObservableUpDownCounter,
    UpDownCounter,
} from "@opentelemetry/api";
import { IncomingMessage, ServerResponse } from "http";
import { NextUrlWithParsedQuery } from "next/dist/server/request-meta";

export type MetricType = "Counter" | "UpDownCounter" | "Histogram" | "ObservableGauge" | "ObservableCounter" | "ObservableUpDownCounter";
export type GenericMetric = Counter | UpDownCounter | Histogram | ObservableGauge | ObservableCounter | ObservableUpDownCounter;
export const OTEL_METER_NAME = "nestjs-otel";

export const meterData: Map<string, GenericMetric> = new Map();

function getOrCreate(name: string, options: MetricOptions = {}, type: MetricType): GenericMetric | undefined {
    let metric = meterData.get(name);
    if (metric === undefined) {
        const meter = metrics.getMeterProvider().getMeter(OTEL_METER_NAME);
        metric = meter[`create${type}`](name, options);
        meterData.set(name, metric);
    }
    return metric;
}

export function getOrCreateHistogram(name: string, options: MetricOptions = {}): Histogram {
    return getOrCreate(name, options, "Histogram") as Histogram;
}

export function getOrCreateCounter(name: string, options: MetricOptions = {}): Counter {
    return getOrCreate(name, options, "Counter") as Counter;
}

export function getOrCreateUpDownCounter(name: string, options: MetricOptions = {}): UpDownCounter {
    return getOrCreate(name, options, "UpDownCounter") as UpDownCounter;
}

export function getOrCreateObservableGauge(name: string, options: MetricOptions = {}): ObservableGauge {
    return getOrCreate(name, options, "ObservableGauge") as ObservableGauge;
}

export function getOrCreateObservableCounter(name: string, options: MetricOptions = {}): ObservableCounter {
    return getOrCreate(name, options, "ObservableCounter") as ObservableCounter;
}

export function getOrCreateObservableUpDownCounter(name: string, options: MetricOptions = {}): ObservableUpDownCounter {
    return getOrCreate(name, options, "ObservableUpDownCounter") as ObservableUpDownCounter;
}

function getStatusCodeClass(code: number): string {
    if (code < 200) return "info";
    if (code < 300) return "success";
    if (code < 400) return "redirect";
    if (code < 500) return "client_error";
    return "server_error";
}

export function withMetrics(handle: (req: IncomingMessage, res: ServerResponse, parsedUrl?: NextUrlWithParsedQuery | undefined) => Promise<void>) {
    // Semantic Convention
    const httpServerRequestCount = getOrCreateCounter("http.server.request.count", {
        description: "Total number of HTTP requests",
        unit: "requests",
    });

    const httpServerDuration = getOrCreateHistogram("http.server.duration", {
        description: "The duration of the inbound HTTP request",
        unit: "ms",
    });

    // Helpers
    const httpServerResponseSuccessCount = getOrCreateCounter("http.server.response.success.count", {
        description: "Total number of all successful responses",
        unit: "responses",
    });

    const httpServerResponseErrorCount = getOrCreateCounter("http.server.response.error.count", {
        description: "Total number of all response errors",
    });

    const httpClientRequestErrorCount = getOrCreateCounter("http.client.request.error.count", {
        description: "Total number of client error requests",
    });

    return async (req: IncomingMessage, res: ServerResponse, parsedUrl?: NextUrlWithParsedQuery | undefined): Promise<void> => {
        const start = performance.now();
        await handle(req, res, parsedUrl);
        if (parsedUrl?.pathname?.match(/^\/_next\//)) {
            // skip metrics
            return;
        }

        const time = performance.now() - start;
        httpServerRequestCount.add(1);

        const status = res.statusCode || 500;
        const attributes: Attributes = {
            //method: req.method,
            //status,
            //url: req.url
        };

        httpServerDuration.record(time, attributes);

        const codeClass = getStatusCodeClass(status);

        switch (codeClass) {
            case "success":
                httpServerResponseSuccessCount.add(1);
                break;
            case "redirect":
                // TODO: Review what should be appropriate for redirects.
                httpServerResponseSuccessCount.add(1);
                break;
            case "client_error":
                httpClientRequestErrorCount.add(1);
                break;
            case "server_error":
                httpServerResponseErrorCount.add(1);
                break;
        }
    };
}
