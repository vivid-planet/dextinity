import { DefaultLogger, type LogContext, type Logger, type LoggerOptions } from "@mikro-orm/core";

import { getOrCreateCounter, getOrCreateHistogram } from "./metrics";

/**
 * Reports SQL query metrics to OpenTelemetry.
 *
 * MikroORM v7 replaced knex with kysely, so query events are no longer exposed on the connection.
 * A custom logger is the supported way to observe every query the ORM runs.
 */
class SqlMetricsLogger extends DefaultLogger implements Logger {
    private readonly sqlQueryCount = getOrCreateCounter("sql.query.count", {
        description: "Total number of SQL queries",
        unit: "queries",
    });

    private readonly sqlQueryErrorCount = getOrCreateCounter("sql.error.count", {
        description: "Total number SQL queries that resulted in an error",
        unit: "queries",
    });

    private readonly sqlQueryDuration = getOrCreateHistogram("sql.query.duration", {
        description: "The duration of SQL queries",
        unit: "ms",
    });

    override logQuery(context: { query: string } & LogContext): void {
        this.sqlQueryCount.add(1);

        if (context.level === "error") {
            this.sqlQueryErrorCount.add(1);
        }

        if (context.took !== undefined) {
            this.sqlQueryDuration.record(context.took);
        }

        super.logQuery(context);
    }
}

export function createSqlMetricsLogger(options: LoggerOptions): Logger {
    return new SqlMetricsLogger(options);
}
