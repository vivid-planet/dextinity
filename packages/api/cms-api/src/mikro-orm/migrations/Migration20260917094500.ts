import { Migration } from "@mikro-orm/migrations";

export class Migration20260917094500 extends Migration {
    override async up(): Promise<void> {
        // Images with a manual focal point but without crop dimensions cannot be cropped and break rendering (e.g. aspectRatio="inherit").
        // They are equivalent to an uncropped image, so the crop area is reset to the full image.
        this.addSql(`
            update "DamFileImage"
            set "cropArea_width" = 100, "cropArea_height" = 100, "cropArea_x" = 0, "cropArea_y" = 0
            where "cropArea_focalPoint" != 'SMART'
                and ("cropArea_width" is null or "cropArea_height" is null or "cropArea_width" = 0 or "cropArea_height" = 0);
        `);
        this.addSql(`
            update "DamFileImage"
            set "cropArea_x" = coalesce("cropArea_x", 0), "cropArea_y" = coalesce("cropArea_y", 0)
            where "cropArea_focalPoint" != 'SMART' and ("cropArea_x" is null or "cropArea_y" is null);
        `);
    }
}
