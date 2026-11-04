import type { HeaderArray, ParserOptionsArgs } from "@fast-csv/parse";
import * as csv from "@fast-csv/parse";
import { Transform, type TransformCallback } from "stream";

import type { ImportFieldMetadata } from "../../decorators/csv-column.decorator";
import type { ImporterPipe, PipeMetadata } from "../importer-pipe.type";

export type CsvParserOptions = Omit<ParserOptionsArgs, "encoding"> & { encoding: BufferEncoding };

export class CsvParsePipe implements ImporterPipe {
    private readonly parserOptions: CsvParserOptions;

    constructor(parserOptions: CsvParserOptions, csvColumns: ImportFieldMetadata[]) {
        this.parserOptions = this.getParserOptions(parserOptions, csvColumns);
    }

    getPipe() {
        return new CsvParser(this.parserOptions);
    }

    private getParserOptions(jobRunParserOptions: CsvParserOptions, csvColumns: ImportFieldMetadata[]) {
        //check entity metadata for csv headers
        const entityHasOnlyNumericCsvColumnNames = csvColumns.every((column) => typeof column.fieldPath === "number");
        const entityHasOnlyStringCsvColumnNames = csvColumns.every((column) => typeof column.fieldPath === "string");
        if (entityHasOnlyNumericCsvColumnNames && entityHasOnlyStringCsvColumnNames) {
            throw new Error(`Error importing: CSV column names must be either all property names or all indices`);
        }

        if (jobRunParserOptions?.headers && entityHasOnlyNumericCsvColumnNames) {
            throw new Error(`Error importing: Cannot use 'parserOptions.headers' when CSV column names are indices`);
        }

        return {
            delimiter: ";",
            quote: '"',
            trim: true,
            ...jobRunParserOptions,
            headers:
                (jobRunParserOptions?.headers ?? entityHasOnlyNumericCsvColumnNames)
                    ? undefined
                    : (headers: HeaderArray) =>
                          headers.map((header) => {
                              if (!header) {
                                  return;
                              }

                              const csvColumn = csvColumns.find((column) => (column.fieldName as string).toLowerCase() === header.toLowerCase());

                              if (!csvColumn) {
                                  // There is no csvColumnName for this column. Will be ignored.
                                  return header;
                              }
                              return csvColumn.key;
                          }),
        };
    }
}

class CsvParser extends Transform {
    private parser: csv.CsvParserStream<csv.Row<unknown>, csv.Row<unknown>>;

    constructor(private readonly options: CsvParserOptions) {
        super({ objectMode: true });
        this.parser = csv.parse({ ...this.options });
    }

    _transform(input: { chunk: Buffer | string; metadata: PipeMetadata }, encoding: BufferEncoding, callback: TransformCallback) {
        const { chunk, metadata } = input;

        this.parser.removeAllListeners();

        this.parser.on("error", (err) => callback(err));
        this.parser.on("data", (row) => {
            this.push({ data: row, metadata });
        });
        this.parser.on("end", () => {
            callback();
        });
        this.parser.write(chunk);

        callback();
    }

    _flush(callback: TransformCallback): void {
        this.parser.end();
        callback();
    }
}
