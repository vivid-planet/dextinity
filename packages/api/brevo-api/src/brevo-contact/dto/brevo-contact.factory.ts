import type { Type } from "@nestjs/common";
import { Field, Int, ObjectType } from "@nestjs/graphql";

import type { BrevoContactAttributesInterface } from "../../types.js";

export interface BrevoContactInterface {
    id: number;
    createdAt: string;
    modifiedAt: string;
    email?: string;
    emailBlacklisted: boolean;
    smsBlacklisted: boolean;
    listIds: number[];
    listUnsubscribed?: number[];
    attributes?: BrevoContactAttributesInterface;
}

export class BrevoContactFactory {
    static create({ BrevoContactAttributes }: { BrevoContactAttributes?: BrevoContactAttributesInterface }): Type<BrevoContactInterface> {
        @ObjectType({ isAbstract: true })
        class BrevoContactBase implements BrevoContactInterface {
            @Field(() => Int)
            id: number;

            @Field(() => String)
            createdAt: string;

            @Field(() => String)
            modifiedAt: string;

            @Field(() => String)
            email: string;

            @Field(() => Boolean)
            emailBlacklisted: boolean;

            @Field(() => Boolean)
            smsBlacklisted: boolean;

            @Field(() => [Int])
            listIds: number[];

            @Field(() => [Int])
            listUnsubscribed?: number[];
        }

        if (BrevoContactAttributes) {
            @ObjectType()
            class BrevoContact extends BrevoContactBase {
                @Field(() => BrevoContactAttributes)
                attributes: typeof BrevoContactAttributes;
            }
            return BrevoContact;
        }

        @ObjectType()
        class BrevoContact extends BrevoContactBase {}
        return BrevoContact;
    }
}
