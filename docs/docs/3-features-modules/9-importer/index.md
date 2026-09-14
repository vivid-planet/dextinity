---
title: Importer
---

# Importer

The Importer module provides a standardized way to import data. It uses Node.js streams to process data efficiently, reducing memory usage when dealing with large datasets.

## Overview

The Importer module uses a pipeline-based architecture that processes data through a series of transformation steps(pipes). This architecture provides:

- Memory-efficient processing via Node.js streams
- Multiple data sources (currently local files, with API requests and S3 buckets planned)
- Support for different data formats (currently CSV, with JSON planned)
- Configurable data transformation
- Validation using class-validator

## Getting Started

To use the Importer module, you'll need to create:

1. An input class that defines the structure of your imported data
2. A custom importer class that sets up the data pipeline
3. One or multiple persist pipes
4. Optional additional transformation pipes

### 1. Creating an Input Class

Create a class that defines the structure of your imported data and decorate its properties with `@CsvColumn`. This defines how CSV columns map to your entity properties.

```typescript
import { CsvColumn, CsvColumnType } from "@dextinity/cms-api";
import { IsString, IsEnum, IsArray, IsOptional, IsBoolean, IsInt, IsDate } from "class-validator";

export class ProductImporterInput {
    @CsvColumn("title")
    @IsString()
    title: string;

    @CsvColumn("status")
    @IsEnum(ProductStatus)
    status: ProductStatus = ProductStatus.Unpublished;

    @CsvColumn("slug")
    @IsString()
    slug: string;

    @CsvColumn("inStock", {
        type: CsvColumnType.Boolean,
        valueMapping: { true: true, false: false, "": false },
    })
    @IsBoolean()
    inStock: boolean = true;

    @CsvColumn("availableSince", {
        type: CsvColumnType.DateTime,
        dateFormatString: "dd-MM-yyyy",
    })
    @IsOptional()
    @IsDate()
    availableSince?: Date = undefined;
}
```

#### `@CsvColumn` Decorator Options

The `@CsvColumn` decorator supports various options for flexible data mapping:

| Option             | Description                                    | Example                                                                                           |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `type`             | Specifies the column data type                 | `CsvColumnType.Boolean`, `CsvColumnType.DateTime`, `CsvColumnType.Integer`, `CsvColumnType.Float` |
| `valueMapping`     | Maps string values to actual data types        | `{ "Yes": true, "No": false, "": false }`                                                         |
| `dateFormatString` | Format string for parsing dates using date-fns | `"dd-MM-yyyy"`, `"dd-MM-yyyy-HH:mm:ss"`                                                           |
| `transform`        | Custom function to transform values            | `(value) => value.split(",").map(v => v.trim())`                                                  |

### 2. Creating a Custom Importer

Create your custom importer class that sets up the data pipeline:

```typescript
import {
    ImporterCsvParseAndTransformPipes,
    ImporterDataStream,
    ImporterEndPipe,
    ImporterInputClass,
} from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/core";
import { Logger } from "@nestjs/common";
import { pipeline, Readable, Transform } from "stream";

import { ProductImporterInput } from "./product-importer.input";
import { ProductPersistPipe } from "./product-persist.pipe";
import { ProductPrePersistPipe } from "./product-pre-persist.pipe";

export class ProductImporter {
    private readonly logger = new Logger(ProductImporter.name);
    dataStream: Readable | null = null;
    name = "productImport";
    importTarget: ImporterInputClass = ProductImporterInput;
    transformPipes: Transform[] = [];

    constructor(private readonly em: EntityManager) {
        this.logger = new Logger("product-importer");
        const parsePipes = new ImporterCsvParseAndTransformPipes(
            this.importTarget,
            this.em,
        ).getPipes(this.logger, { encoding: "utf-8" });

        this.transformPipes = [
            ...parsePipes,
            new ProductPrePersistPipe(this.em).getPipe(this.logger),
            new ProductPersistPipe(this.em).getPipe(this.logger),
            new Transform({
                objectMode: true,
                transform: this.displayData.bind(this),
            }),
            new ImporterEndPipe().getPipe(),
        ];
    }

    async init({ dataStream }: { dataStream: ImporterDataStream }): Promise<void> {
        this.dataStream = await dataStream.getDataStreamAndMetadata();
    }

    async executeRun(): Promise<boolean> {
        const dataStream = this.dataStream;
        if (dataStream) {
            return new Promise((resolve, reject) => {
                return pipeline([dataStream, ...this.transformPipes], (error) => {
                    this.transformPipes.map((stream) => stream.end());
                    if (error) {
                        this.logger.error(error);
                        reject(error);
                    } else {
                        this.logger.log("DataStream piped successfully");
                        resolve(true);
                    }
                });
            });
        }
        return false;
    }

    // Optional method to log data during import
    async displayData(
        row: Record<string, unknown>,
        encoding: string,
        callback: (error?: Error | null, data?: object[]) => void,
    ): Promise<void> {
        this.logger.log("row: ", JSON.stringify(row, null, 2));
        return callback(null);
    }
}
```

### 3. Creating Custom Pipes

You can create custom pipes for pre-processing or persisting your data:

```typescript
import { ImporterPipe } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/core";
import { LoggerService } from "@nestjs/common";
import { Transform, TransformCallback } from "stream";

export class ProductPrePersistPipe implements ImporterPipe {
    constructor(private readonly em: EntityManager) {}

    getPipe(logger: LoggerService) {
        return new ProductPrePersist(this.em, logger);
    }
}

class ProductPrePersist extends Transform {
    constructor(
        private readonly em: EntityManager,
        private readonly logger: LoggerService,
    ) {
        super({ writableObjectMode: true, objectMode: true });
    }

    async _transform(
        inputDataAndMetadata: { data: Record<string, unknown>; metadata: Record<string, unknown> },
        encoding: BufferEncoding,
        callback: TransformCallback,
    ) {
        try {
            // Implement your custom transformation logic here

            // Pass the data to the next pipe
            this.push(transformedData);
        } catch (error: unknown) {
            await this.logger.error(`Error: ${error}`);
            callback(error instanceof Error ? error : new Error(`Unknown error: ${error}`));
        }

        callback();
    }
}
```

### 4. Using the Importer

:::note
This is usually done in a console job.
:::

After setting up your importer, you can use it like this:

```typescript
import { ImporterLocalFileDataStream } from "@dextinity/cms-api";

// Create a local file data stream
const dataStream = new ImporterLocalFileDataStream("/path/to/your/file.csv");

// Initialize the importer with the data stream
const importer = new ProductImporter(entityManager);
await importer.init({ dataStream });

// Execute the import
const result = await importer.executeRun();
```

## Core Components

### Data Streams

Data streams provide the input data for the importer:

- `ImporterDataStream`: Base abstract class for all data streams
- `FileDataStream`: Base class for file-based data streams
- `ImporterLocalFileDataStream`: Implementation for local file system

Future implementations will include:

- API request data streams
- S3 bucket data streams

### Pipes

Pipes process the data as it flows through the import pipeline:

- `CsvParsePipe`: Parses CSV data into objects
- `DataTransformerPipe`: Transforms raw objects into typed instances
- `DataValidatorPipe`: Validates data using class-validator
- Custom pipes: Implement your own transformation or persistence logic

### Composite Pipes

- `ImporterCsvParseAndTransformPipes`: Combines CSV parsing, transformation, and validation

## Advanced Usage

### Custom Value Transformations

Use the `transform` option in `@CsvColumn` to implement custom value transformations:

```typescript
@CsvColumn("additionalTypes", {
  transform: (value: string) =>
    value ? value.split(",").map(type =>
      ProductType[type.trim() as keyof typeof ProductType]
    ) : [],
})
@IsArray()
@IsEnum(ProductType, { each: true })
additionalTypes: ProductType[] = [];
```

### Working with Relationships

You can handle entity relationships that need to exist before the main entity is persisted by using pre-persist pipes:

```typescript
// In pre-persist pipe
const category = await this.em.upsert(ProductCategory, categoryData, {
    onConflictFields: ["slug"],
    onConflictAction: "merge",
    onConflictExcludeFields: ["id"],
});

// Update the data with a reference
const outputData = {
    ...inputDataAndMetadata,
    data: {
        ...data,
        category: Reference.create(category),
    },
};
```

Relationships that need the main entity can be persisted in the main persist pipe.
