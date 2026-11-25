import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import type { LinkBlock } from "@src/common/blocks/link.block";
import { ResponsiveBehavior } from "@src/common/blocks/table/create-responsive-table-block";
import { faker } from "@src/db/fixtures/faker";
import type { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service";

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

/** Content of a description cell, to be encoded by the concrete fixture service. */
export interface DescriptionCellContent {
    jobTitle: string;
    textBeforeLink: string;
    linkText: string;
    textAfterLink: string;
    link: LinkInput;
}

const columnIds = {
    name: "name",
    email: "email",
    address: "address",
    description: "description",
    image: "image",
} as const;

/**
 * Generates the columns and rows of a table block, leaving the content of the cells to the subclass.
 * The image column is only added when the subclass supports image cells.
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
            { id: columnIds.name, size: "standard", highlighted: false },
            { id: columnIds.email, size: "standard", highlighted: false },
            { id: columnIds.address, size: "large", highlighted: false },
            { id: columnIds.description, size: "extraLarge", highlighted: false },
        ];

        if (this.createImageCell) {
            columns.push({ id: columnIds.image, size: "small", highlighted: false });
        }

        const headerRow: TableRowInput<CellInput> = {
            id: faker.string.uuid(),
            highlighted: true,
            cellValues: [
                { columnId: columnIds.name, value: this.createSimpleCellRichText("Name") },
                { columnId: columnIds.email, value: this.createSimpleCellRichText("Email") },
                { columnId: columnIds.address, value: this.createSimpleCellRichText("Address") },
                { columnId: columnIds.description, value: this.createSimpleCellRichText("Description") },
                ...(this.createImageCell ? [{ columnId: columnIds.image, value: this.createSimpleCellRichText("Image") }] : []),
            ],
        };

        const dataRowCount = faker.number.int({ min: 4, max: 5 });
        const dataRows = await Promise.all(Array.from({ length: dataRowCount }, () => this.generateDataRow()));

        return { columns, rows: [headerRow, ...dataRows] };
    }

    protected abstract createSimpleCellRichText(text: string): CellInput;

    protected abstract createDescriptionCellRichText(content: DescriptionCellContent): CellInput;

    protected createImageCell?(): Promise<CellInput>;

    private async generateDataRow(): Promise<TableRowInput<CellInput>> {
        const imageCellValues = this.createImageCell ? [{ columnId: columnIds.image, value: await this.createImageCell() }] : [];

        return {
            id: faker.string.uuid(),
            highlighted: false,
            cellValues: [
                { columnId: columnIds.name, value: this.createSimpleCellRichText(faker.person.fullName()) },
                { columnId: columnIds.email, value: this.createSimpleCellRichText(faker.internet.email()) },
                { columnId: columnIds.address, value: this.createSimpleCellRichText(faker.location.streetAddress({ useFullAddress: true })) },
                { columnId: columnIds.description, value: this.createDescriptionCellRichText(await this.generateDescriptionCellContent()) },
                ...imageCellValues,
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
