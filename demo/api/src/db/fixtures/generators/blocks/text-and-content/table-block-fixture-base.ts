import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import type { LinkBlock } from "@src/common/blocks/link.block";
import { faker } from "@src/db/fixtures/faker";
import type { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service";

type LinkInput = ExtractBlockInputFactoryProps<typeof LinkBlock>;

type ColumnSize = "extraSmall" | "small" | "standard" | "large" | "extraLarge";

interface TableColumnInput {
    id: string;
    size: ColumnSize;
    highlighted: boolean;
}

interface TableCellValueInput<RichTextInput> {
    columnId: string;
    value: RichTextInput;
}

interface TableRowInput<RichTextInput> {
    id: string;
    highlighted: boolean;
    cellValues: TableCellValueInput<RichTextInput>[];
}

interface TableBlockInput<RichTextInput> {
    columns: TableColumnInput[];
    rows: TableRowInput<RichTextInput>[];
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
    name: "name",
    email: "email",
    address: "address",
    description: "description",
} as const;

/**
 * Generates the columns and rows of a table block, leaving the rich text of the cells to the subclass.
 *
 * `createTableBlock` returns a plain `Block`, so the input types can't be derived from it and are declared here.
 */
export abstract class TableBlockFixtureBase<RichTextInput> {
    constructor(private readonly linkBlockFixtureService: LinkBlockFixtureService) {}

    async generateBlockInput(): Promise<TableBlockInput<RichTextInput>> {
        const columns: TableColumnInput[] = [
            { id: columnIds.name, size: "standard", highlighted: false },
            { id: columnIds.email, size: "standard", highlighted: false },
            { id: columnIds.address, size: "large", highlighted: false },
            { id: columnIds.description, size: "extraLarge", highlighted: false },
        ];

        const headerRow: TableRowInput<RichTextInput> = {
            id: faker.string.uuid(),
            highlighted: true,
            cellValues: [
                { columnId: columnIds.name, value: this.createSimpleCellRichText("Name") },
                { columnId: columnIds.email, value: this.createSimpleCellRichText("Email") },
                { columnId: columnIds.address, value: this.createSimpleCellRichText("Address") },
                { columnId: columnIds.description, value: this.createSimpleCellRichText("Description") },
            ],
        };

        const dataRowCount = faker.number.int({ min: 4, max: 5 });
        const dataRows = await Promise.all(Array.from({ length: dataRowCount }, () => this.generateDataRow()));

        return { columns, rows: [headerRow, ...dataRows] };
    }

    protected abstract createSimpleCellRichText(text: string): RichTextInput;

    protected abstract createDescriptionCellRichText(content: DescriptionCellContent): RichTextInput;

    private async generateDataRow(): Promise<TableRowInput<RichTextInput>> {
        return {
            id: faker.string.uuid(),
            highlighted: false,
            cellValues: [
                { columnId: columnIds.name, value: this.createSimpleCellRichText(faker.person.fullName()) },
                { columnId: columnIds.email, value: this.createSimpleCellRichText(faker.internet.email()) },
                { columnId: columnIds.address, value: this.createSimpleCellRichText(faker.location.streetAddress({ useFullAddress: true })) },
                { columnId: columnIds.description, value: this.createDescriptionCellRichText(await this.generateDescriptionCellContent()) },
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
