import { Injectable, NestMiddleware } from "@nestjs/common";
import { Attributes, Counter, Histogram } from "@opentelemetry/api";
import responseTime from "response-time";

import { getOrCreateCounter, getOrCreateHistogram } from "./metrics";

//adapted from https://github.com/pragmaticivan/nestjs-otel/
@Injectable()
export class ApiMetricsMiddleware implements NestMiddleware {
    private httpServerRequestCount: Counter;

    private httpServerResponseCount: Counter;

    private httpServerDuration: Histogram;

    private httpServerRequestSize: Histogram;

    private httpServerResponseSize: Histogram;

    private httpServerResponseSuccessCount: Counter;

    private httpServerResponseErrorCount: Counter;

    private httpClientRequestErrorCount: Counter;

    private httpServerAbortCount: Counter;

    constructor() {
        // Semantic Convention
        this.httpServerRequestCount = getOrCreateCounter("http.server.request.count", {
            description: "Total number of HTTP requests",
            unit: "requests",
        });

        this.httpServerResponseCount = getOrCreateCounter("http.server.response.count", {
            description: "Total number of HTTP responses",
            unit: "responses",
        });

        this.httpServerAbortCount = getOrCreateCounter("http.server.abort.count", {
            description: "Total number of data transfers aborted",
            unit: "requests",
        });

        this.httpServerDuration = getOrCreateHistogram("http.server.duration", {
            description: "The duration of the inbound HTTP request",
            unit: "ms",
        });

        this.httpServerRequestSize = getOrCreateHistogram("http.server.request.size", {
            description: "Size of incoming bytes",
            unit: "By",
        });

        this.httpServerResponseSize = getOrCreateHistogram("http.server.response.size", {
            description: "Size of outgoing bytes",
            unit: "By",
        });

        // Helpers
        this.httpServerResponseSuccessCount = getOrCreateCounter("http.server.response.success.count", {
            description: "Total number of all successful responses",
            unit: "responses",
        });

        this.httpServerResponseErrorCount = getOrCreateCounter("http.server.response.error.count", {
            description: "Total number of all response errors",
        });

        this.httpClientRequestErrorCount = getOrCreateCounter("http.client.request.error.count", {
            description: "Total number of client error requests",
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    use(req: any, res: any, next: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseTime((req: any, res: any, time: any) => {
            //const { url } = req;

            this.httpServerRequestCount.add(1, { method: req.method /*, url*/ });

            const requestLength = parseInt(req.headers["content-length"], 10) || 0;
            const responseLength: number = parseInt(res.getHeader("Content-Length"), 10) || 0;

            const status = res.statusCode || 500;
            const attributes: Attributes = {
                method: req.method,
                //status,
                //url, should we add url attribute? (will export one metric per url)
            };

            this.httpServerRequestSize.record(requestLength, attributes);
            this.httpServerResponseSize.record(responseLength, attributes);

            this.httpServerResponseCount.add(1, attributes);
            this.httpServerDuration.record(time, attributes);

            const codeClass = this.getStatusCodeClass(status);

            switch (codeClass) {
                case "success":
                    this.httpServerResponseSuccessCount.add(1);
                    break;
                case "redirect":
                    // TODO: Review what should be appropriate for redirects.
                    this.httpServerResponseSuccessCount.add(1);
                    break;
                case "client_error":
                    this.httpClientRequestErrorCount.add(1);
                    break;
                case "server_error":
                    this.httpServerResponseErrorCount.add(1);
                    break;
            }

            req.on("end", () => {
                if (req.aborted === true) {
                    this.httpServerAbortCount.add(1);
                }
            });
        })(req, res, next);
    }

    private getStatusCodeClass(code: number): string {
        if (code < 200) {
            return "info";
        }
        if (code < 300) {
            return "success";
        }
        if (code < 400) {
            return "redirect";
        }
        if (code < 500) {
            return "client_error";
        }
        return "server_error";
    }
}
