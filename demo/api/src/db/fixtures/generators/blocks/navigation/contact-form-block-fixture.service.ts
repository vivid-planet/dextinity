import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { ContactFormBlock } from "@src/common/blocks/contact-form.block.js";

@Injectable()
export class ContactFormBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof ContactFormBlock>> {
        return {};
    }
}
