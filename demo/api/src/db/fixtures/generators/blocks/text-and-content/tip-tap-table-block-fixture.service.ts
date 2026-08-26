import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { TipTapTableBlock } from "@src/common/blocks/tip-tap-table.block";
import { faker } from "@src/db/fixtures/faker";
import { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service";

type TipTapTableInput = ExtractBlockInputFactoryProps<typeof TipTapTableBlock>;
type TipTapContent = TipTapTableInput["tipTapContent"];

const standardParagraphStyle = "paragraph300";
const smallParagraphStyle = "paragraph200";

const cell = ({ type, content }: { type: "tableCell" | "tableHeader"; content: TipTapContent[] }): TipTapContent => ({
    type,
    attrs: { colspan: 1, rowspan: 1, colwidth: null },
    content,
});

const paragraph = ({ text, textBlockStyle }: { text: string; textBlockStyle: string }): TipTapContent => ({
    type: "paragraph",
    attrs: { textBlockStyle },
    content: [{ type: "text", text }],
});

const textCell = (text: string): TipTapContent => cell({ type: "tableCell", content: [paragraph({ text, textBlockStyle: standardParagraphStyle })] });

const headerCell = (text: string): TipTapContent =>
    cell({ type: "tableHeader", content: [paragraph({ text, textBlockStyle: standardParagraphStyle })] });

@Injectable()
export class TipTapTableBlockFixtureService {
    constructor(private readonly linkBlockFixtureService: LinkBlockFixtureService) {}

    async generateBlockInput(): Promise<TipTapTableInput> {
        const dataRowCount = faker.number.int({ min: 4, max: 5 });
        const dataRows = await Promise.all(Array.from({ length: dataRowCount }, () => this.generateDataRow()));

        return {
            tipTapContent: {
                type: "doc",
                content: [
                    {
                        type: "table",
                        content: [
                            {
                                type: "tableRow",
                                content: [headerCell("Name"), headerCell("Email"), headerCell("Address"), headerCell("Description")],
                            },
                            ...dataRows,
                        ],
                    },
                ],
            },
        };
    }

    private async generateDataRow(): Promise<TipTapContent> {
        return {
            type: "tableRow",
            content: [
                textCell(faker.person.fullName()),
                textCell(faker.internet.email()),
                textCell(faker.location.streetAddress({ useFullAddress: true })),
                await this.generateDescriptionCell(),
            ],
        };
    }

    private async generateDescriptionCell(): Promise<TipTapContent> {
        const link = await this.linkBlockFixtureService.generateBlockInput();

        return cell({
            type: "tableCell",
            content: [
                paragraph({ text: faker.person.jobTitle(), textBlockStyle: standardParagraphStyle }),
                {
                    type: "paragraph",
                    attrs: { textBlockStyle: smallParagraphStyle },
                    content: [
                        { type: "text", text: `${faker.lorem.words(faker.number.int({ min: 3, max: 6 }))} ` },
                        { type: "text", marks: [{ type: "link", attrs: { data: link } }], text: faker.lorem.words(3) },
                        { type: "text", text: ` ${faker.lorem.words(faker.number.int({ min: 3, max: 6 }))}` },
                    ],
                },
            ],
        });
    }
}
