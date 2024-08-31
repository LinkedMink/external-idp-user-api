import { Test, TestingModule } from "@nestjs/testing";
import { mock } from "jest-mock-extended";
import { TokenSigningService } from "../../src/services/token-signing.service.js";
import { AppController } from "../../src/controllers/app.controller.js";

describe(AppController.name, () => {
  let testingModule: TestingModule;
  const stubPublicKey = {};

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: TokenSigningService,
          useFactory: () => mock<TokenSigningService>({ publicKey: stubPublicKey }),
        },
      ],
    }).compile();
  });

  it("should return current date time when called", () => {
    const stubbedDateTime = new Date(10, 10, 10, 10, 10, 10, 10);
    jest.useFakeTimers();
    jest.setSystemTime(stubbedDateTime);

    const appController = testingModule.get(AppController);
    const result = appController.get();

    expect(result).toEqual({
      timestamp: stubbedDateTime,
      isHealthy: true,
    });
  });

  it("should return public key when getKeys() called", () => {
    const appController = testingModule.get(AppController);
    const result = appController.getKeys();

    expect(result).toEqual({
      keys: [stubPublicKey],
    });
  });
});
