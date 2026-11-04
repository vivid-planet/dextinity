import { Type } from "@mikro-orm/postgresql";
import { Field, InputType, ObjectType } from "@nestjs/graphql";

@ObjectType()
@InputType("CoordinatesInput")
export class Coordinates {
    @Field()
    latitude: number;

    @Field()
    longitude: number;
}

export class CoordinatesType extends Type<Coordinates | null, string | null> {
    convertToDatabaseValue(value: Coordinates | null): string | null {
        if (!value) {
            return null;
        }

        return `(${value.latitude},${value.longitude})`;
    }

    convertToJSValue(value: string): Coordinates | null {
        if (!value) {
            return null;
        }

        const match = value.match(/\(([^,]+),([^)]+)\)/);
        if (!match) {
            throw new Error("Invalid coordinate format");
        }
        return {
            latitude: parseFloat(match[1]),
            longitude: parseFloat(match[2]),
        };
    }

    getColumnType(): string {
        return "point";
    }
}
