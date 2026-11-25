import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import type { LinkBlock } from "@src/common/blocks/link.block.js";
import { ResponsiveBehavior } from "@src/common/blocks/table/create-responsive-table-block.js";
import { faker } from "@src/db/fixtures/faker.js";
import type { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service.js";

type LinkInput = ExtractBlockInputFactoryProps<typeof LinkBlock>;

type ColumnSize = "extraSmall" | "small" | "standard" | "large" | "extraLarge";

interface TableColumnInput {
    id: string;
    size: ColumnSize;
    highlighted: boolean;
}

interface TableCellValueInput<CellInput> {
    columnId: string;
    value: CellInput;
}

interface TableRowInput<CellInput> {
    id: string;
    highlighted: boolean;
    cellValues: TableCellValueInput<CellInput>[];
}

interface TableContentInput<CellInput> {
    columns: TableColumnInput[];
    rows: TableRowInput<CellInput>[];
}

interface TableBlockInput<CellInput> {
    table: TableContentInput<CellInput>;
    responsiveBehavior: ResponsiveBehavior;
}

/** Content of a description cell, to be encoded by the rich text editor of the concrete fixture service. */
export interface DescriptionCellContent {
    jobTitle: string;
    textBeforeLink: string;
    linkText: string;
    textAfterLink: string;
    link: LinkInput;
}

const columnIds = {
    photo: "photo",
    name: "name",
    email: "email",
    address: "address",
    description: "description",
    hourlyRate: "hourlyRate",
} as const;

/**
 * Generates the columns and rows of a table block, leaving the cell blocks to the subclass.
 *
 * `createTableBlock` returns a plain `Block`, so the input types can't be derived from it and are declared here.
 */
export abstract class TableBlockFixtureBase<CellInput> {
    constructor(private readonly linkBlockFixtureService: LinkBlockFixtureService) {}

    async generateBlockInput(): Promise<TableBlockInput<CellInput>> {
        return {
            table: await this.generateTableContentInput(),
            responsiveBehavior: faker.helpers.arrayElement(Object.values(ResponsiveBehavior)),
        };
    }

    private async generateTableContentInput(): Promise<TableContentInput<CellInput>> {
        const columns: TableColumnInput[] = [
            { id: columnIds.photo, size: "small", highlighted: false },
            { id: columnIds.name, size: "standard", highlighted: false },
            { id: columnIds.email, size: "standard", highlighted: false },
            { id: columnIds.address, size: "large", highlighted: false },
            { id: columnIds.description, size: "extraLarge", highlighted: false },
            { id: columnIds.hourlyRate, size: "small", highlighted: false },
        ];

        const headerRow: TableRowInput<CellInput> = {
            id: faker.string.uuid(),
            highlighted: true,
            cellValues: [
                { columnId: columnIds.photo, value: this.createSimpleCellRichText("Photo") },
                { columnId: columnIds.name, value: this.createSimpleCellRichText("Name") },
                { columnId: columnIds.email, value: this.createSimpleCellRichText("Email") },
                { columnId: columnIds.address, value: this.createSimpleCellRichText("Address") },
                { columnId: columnIds.description, value: this.createSimpleCellRichText("Description") },
                { columnId: columnIds.hourlyRate, value: this.createSimpleCellRichText("Hourly rate") },
            ],
        };

        const dataRowCount = faker.number.int({ min: 4, max: 5 });
        const dataRows = await Promise.all(Array.from({ length: dataRowCount }, () => this.generateDataRow()));

        return { columns, rows: [headerRow, ...dataRows] };
    }

    protected abstract createSimpleCellRichText(text: string): CellInput;

    protected abstract createDescriptionCellRichText(content: DescriptionCellContent): CellInput;

    protected abstract createPriceCell(amount: number): CellInput;

    protected abstract createImageCell(): Promise<CellInput>;

    private async generateDataRow(): Promise<TableRowInput<CellInput>> {
        return {
            id: faker.string.uuid(),
            highlighted: false,
            cellValues: [
                { columnId: columnIds.photo, value: await this.createImageCell() },
                { columnId: columnIds.name, value: this.createSimpleCellRichText(faker.person.fullName()) },
                { columnId: columnIds.email, value: this.createSimpleCellRichText(faker.internet.email()) },
                { columnId: columnIds.address, value: this.createSimpleCellRichText(faker.location.streetAddress({ useFullAddress: true })) },
                { columnId: columnIds.description, value: this.createDescriptionCellRichText(await this.generateDescriptionCellContent()) },
                { columnId: columnIds.hourlyRate, value: this.createPriceCell(faker.number.float({ min: 40, max: 200, fractionDigits: 2 })) },
            ],
        };
    }

    private async generateDescriptionCellContent(): Promise<DescriptionCellContent> {
        const jobTitle = faker.person.jobTitle();
        const linkText = faker.lorem.words(3);
        const textBeforeLink = `${faker.lorem.words(faker.number.int({ min: 3, max: 6 }))} `;
        const textAfterLink = ` ${faker.lorem.words(faker.number.int({ min: 3, max: 6 }))}`;
        const link = await this.linkBlockFixtureService.generateBlockInput();

        return { jobTitle, linkText, textBeforeLink, textAfterLink, link };
    }
}
