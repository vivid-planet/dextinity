import { MikroORM } from "@mikro-orm/postgresql";
import { Logger } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

@Command({ name: "migrate", description: "Runs all migrations" })
export class MigrateCommand extends CommandRunner {
    private readonly logger = new Logger(MigrateCommand.name);

    constructor(private readonly orm: MikroORM) {
        super();
    }

    private async sleep(s: number): Promise<unknown> {
        return new Promise((resolve) => {
            setTimeout(resolve, s * 1000);
        });
    }

    async run(): Promise<void> {
        this.logger.log("Running migrations...");
        const em = this.orm.em.fork();

        try {
            // as our application can have multiple replicas, we need to make sure, migrations are executed only once
            await em.begin();

            const connection = em.getConnection();
            // we can't use MikroORM's migrations table as lock object, because it does not exist on first run, so we bring our own lock object
            await connection.execute(
                `CREATE TABLE IF NOT EXISTS "MigrationsLock" ("id" int NOT NULL, PRIMARY KEY ("id"))`,
                undefined,
                undefined,
                em.getTransactionContext(),
            );

            let lockTries = 0;
            let lockAcquired = false;
            while (!lockAcquired) {
                try {
                    // we lock in exclusive mode, so any other transactions fails immediately (NOWAIT)
                    // lock gets automatically released on commit or rollback
                    await connection.execute(
                        `LOCK TABLE "MigrationsLock" IN EXCLUSIVE MODE NOWAIT`,
                        undefined,
                        undefined,
                        em.getTransactionContext(),
                    );
                    lockAcquired = true;
                } catch (error) {
                    await em.rollback();
                    this.logger.warn(error);
                    this.logger.warn(`Cannot acquire lock for table MigrationsLock (try ${++lockTries})`);
                    if (lockTries > 3600) {
                        this.logger.error(`Giving up...`);
                        throw new Error("Could not acquire lock for table MigrationsLock");
                    }
                    await this.sleep(1);
                    await em.begin(em.getTransactionContext());
                }
            }
            const migrator = this.orm.migrator;
            await migrator.up({
                transaction: em.getTransactionContext(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any); // https://mikro-orm.io/docs/migrations/#providing-transaction-context

            this.logger.log(`Executed migrations. Trying to commit...`);
            await em.commit();
            this.logger.log("Migrations successfully committed");
        } catch (error) {
            this.logger.error(error);
            await em.rollback();

            // we need to fail with non-zero exit-code, so migrations will be retried by kubernetes with exponential back-off
            process.exit(-1);
        }
    }
}
