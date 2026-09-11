import { Migration } from "@mikro-orm/migrations";

export class Migration20260707120000 extends Migration {
    override async up(): Promise<void> {
        // Index the EntityInfo join keys: gives the planner statistics + a fast probe on these JSONB
        // expressions. Without it a nested loop can rescan the EntityInfo union once per warning row
        // (seconds on skewed data); with it that becomes an index probe.
        this.addSql(
            `create index "Warning_sourceinfo_join_index" on "Warning" (("sourceInfo"->>'rootEntityName'), ("sourceInfo"->>'targetId'));`,
        );
    }
}
