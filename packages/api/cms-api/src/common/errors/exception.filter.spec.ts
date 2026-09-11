import { type ArgumentsHost, BadRequestException, HttpException, InternalServerErrorException } from "@nestjs/common";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { DextinityEntityNotFoundException } from "./entity-not-found.exception";
import { ExceptionFilter } from "./exception.filter";
import { DextinityValidationException } from "./validation.exception";

const graphQLHost = {
    getType: () => "graphql",
} as ArgumentsHost;

vi.spyOn(console, "error").mockImplementation(() => {
    // noop
});

describe("ExceptionFilter", () => {
    describe("catch", () => {
        describe("graphql", () => {
            it("returns BadRequestException for DextinityException", () => {
                const exceptionFilter = new ExceptionFilter(false);

                const returnError = exceptionFilter.catch(new DextinityEntityNotFoundException("Not found"), graphQLHost);

                expect(returnError).toBeInstanceOf(BadRequestException);
                expect((returnError as BadRequestException).getResponse()).toEqual({
                    statusCode: 400,
                    message: "Not found",
                    error: "DextinityEntityNotFoundException",
                    validationErrors: [],
                });
            });

            it("returns BadRequestException for DextinityValidationException", () => {
                const exceptionFilter = new ExceptionFilter(false);

                const returnError = exceptionFilter.catch(new DextinityValidationException("Invalid", [{ property: "prop1" }]), graphQLHost);

                expect(returnError).toBeInstanceOf(BadRequestException);
                expect((returnError as BadRequestException).getResponse()).toEqual({
                    statusCode: 400,
                    message: "Invalid",
                    error: "DextinityValidationException",
                    validationErrors: [
                        {
                            property: "prop1",
                        },
                    ],
                });
            });

            it("returns HttpException for HttpException", () => {
                const exceptionFilter = new ExceptionFilter(false);

                const returnError = exceptionFilter.catch(new HttpException("Unauthorized", 401), graphQLHost);

                expect(returnError).toBeInstanceOf(HttpException);
                expect((returnError as HttpException).getResponse()).toBe("Unauthorized");
            });

            it("returns InternalServerErrorException for normal Error in non-debug mode", () => {
                const exceptionFilter = new ExceptionFilter(false);

                const returnError = exceptionFilter.catch(new Error("Other error"), graphQLHost);

                expect(returnError).toBeInstanceOf(InternalServerErrorException);
                expect((returnError as InternalServerErrorException).getResponse()).toEqual({
                    message: "Internal Server Error",
                    statusCode: 500,
                });
            });

            it("returns real Error for normal Error in debug mode", () => {
                const exceptionFilter = new ExceptionFilter(true);

                const returnError = exceptionFilter.catch(new Error("Other error"), graphQLHost);

                expect(returnError).toBeInstanceOf(Error);
                expect((returnError as Error).message).toBe("Other error");
            });
        });

        describe("http", () => {
            let httpHost: ArgumentsHost;
            let statusMock: Mock;
            let jsonMock: Mock;

            beforeEach(() => {
                statusMock = vi.fn();
                jsonMock = vi.fn();

                httpHost = {
                    getType: () => "http",
                    switchToHttp: vi.fn(() => ({
                        getResponse: vi.fn(() => ({
                            status: statusMock.mockReturnThis(),
                            json: jsonMock,
                        })),
                    })),
                } as unknown as ArgumentsHost;
            });

            it("response status is 400 and json is correct for DextinityException", () => {
                const exceptionFilter = new ExceptionFilter(false);

                exceptionFilter.catch(new DextinityEntityNotFoundException("Not found"), httpHost);

                const responseMock = httpHost.switchToHttp().getResponse();
                expect(responseMock.status).toHaveBeenCalledWith(400);
                expect(responseMock.json).toHaveBeenCalledWith({
                    statusCode: 400,
                    message: "Not found",
                    error: "DextinityEntityNotFoundException",
                    validationErrors: [],
                });
            });

            it("response status is 400 and json is correct for DextinityValidationException", () => {
                const exceptionFilter = new ExceptionFilter(false);

                exceptionFilter.catch(new DextinityValidationException("Invalid", [{ property: "prop1" }]), httpHost);

                const responseMock = httpHost.switchToHttp().getResponse();
                expect(responseMock.status).toHaveBeenCalledWith(400);
                expect(responseMock.json).toHaveBeenCalledWith({
                    statusCode: 400,
                    message: "Invalid",
                    error: "DextinityValidationException",
                    validationErrors: [
                        {
                            property: "prop1",
                        },
                    ],
                });
            });

            it("response status is 401 and message is correct for HttpException", () => {
                const exceptionFilter = new ExceptionFilter(false);

                exceptionFilter.catch(new HttpException("Unauthorized", 401), httpHost);

                const responseMock = httpHost.switchToHttp().getResponse();
                expect(responseMock.status).toHaveBeenCalledWith(401);
                expect(responseMock.json).toHaveBeenCalledWith("Unauthorized");
            });

            it("response status is 500 and json is correct for normal Error in non-debug mode", () => {
                const exceptionFilter = new ExceptionFilter(false);

                exceptionFilter.catch(new Error("Other error"), httpHost);

                const responseMock = httpHost.switchToHttp().getResponse();
                expect(responseMock.status).toHaveBeenCalledWith(500);
                expect(responseMock.json).toHaveBeenCalledWith({ message: "Internal Server Error", statusCode: 500 });
            });

            it("response status is 500 and json contains real error for normal Error in debug mode", () => {
                const exceptionFilter = new ExceptionFilter(true);

                exceptionFilter.catch(new Error("Other error"), httpHost);

                const responseMock = httpHost.switchToHttp().getResponse();
                expect(responseMock.status).toHaveBeenCalledWith(500);
                expect(responseMock.json).toHaveBeenCalledWith({ message: "Other error", statusCode: 500 });
            });
        });
    });
});
