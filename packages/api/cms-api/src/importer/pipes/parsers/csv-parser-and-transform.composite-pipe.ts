import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import type { LoggerService } from "@nestjs/common";
import type { Transform } from "stream";

import { getFieldMetadata, type ImportFieldMetadata } from "../../decorators/csv-column.decorator";
import type { ImporterInputClass } from "../../importer-input.type";
import type { CompositeImporterPipe } from "../importer-pipe.type";
import { CsvParsePipe, type CsvParserOptions } from "./csv-parser.pipe";
import { DataTransformerPipe } from "./data-transformer.pipe";
import { DataValidatorPipe } from "./data-validator.pipe";

export class ImporterCsvParseAndTransformPipes implements CompositeImporterPipe {
    private readonly fields: ImportFieldMetadata[];

    constructor(
        private readonly inputClass: ImporterInputClass,
        em: EntityManager<IDatabaseDriver<Connection>>,
    ) {
        this.fields = getFieldMetadata(inputClass);
    }

    getPipes(logger: LoggerService, parserOptions: CsvParserOptions): Transform[] {
        const parserPipe = new CsvParsePipe(parserOptions, this.fields).getPipe();
        const transformPipe = new DataTransformerPipe(this.inputClass).getPipe(logger);
        const validatorPipe = new DataValidatorPipe().getPipe(logger);

        const pipes: Transform[] = [parserPipe, transformPipe, validatorPipe];
        return pipes;
    }
}
