import { Field, ObjectType } from "@nestjs/graphql";

import { MainMenuItem } from "../entities/main-menu-item.entity.js";

@ObjectType("MainMenu")
export class MainMenuObject {
    @Field(() => [MainMenuItem])
    items: MainMenuItem[];
}
