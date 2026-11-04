import type { EntityManager } from "@mikro-orm/core";
import type { EntityRepository } from "@mikro-orm/postgresql";
import { Logger } from "@nestjs/common";
import type { Transporter } from "nodemailer";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MailerLog } from "./entities/mailer-log.entity";
import { MailerService } from "./mailer.service";

describe("MailerService.sendMail", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createService({ nativeDelete }: { nativeDelete: () => Promise<number> }) {
        const mailerTransport = { sendMail: vi.fn().mockResolvedValue({ messageId: "message-id" }) } as unknown as Transporter;
        const mailerLogRepository = { nativeDelete: vi.fn(nativeDelete) } as unknown as EntityRepository<MailerLog<unknown>>;

        const service = new MailerService(
            { defaultFrom: "sender@example.com" },
            mailerTransport,
            null as unknown as EntityManager,
            mailerLogRepository,
        );

        return { service, mailerLogRepository };
    }

    it("deletes outdated mail logs", async () => {
        const { service, mailerLogRepository } = createService({ nativeDelete: () => Promise.resolve(1) });

        await service.sendMail({ to: "recipient@example.com", subject: "Subject", text: "Text", logMail: false });

        expect(mailerLogRepository.nativeDelete).toHaveBeenCalledWith({ createdAt: { $lt: expect.any(Date) } });
    });

    it("logs instead of rejecting when deleting outdated mail logs fails", async () => {
        const loggerErrorSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        const { service } = createService({ nativeDelete: () => Promise.reject(new Error("delete failed")) });

        await expect(service.sendMail({ to: "recipient@example.com", subject: "Subject", text: "Text", logMail: false })).resolves.toEqual({
            messageId: "message-id",
        });

        await vi.waitFor(() => expect(loggerErrorSpy).toHaveBeenCalledWith("Failed to delete outdated mail logs", expect.any(Error)));
    });
});
