import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";

describe(AppController.name, () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
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
    });
  });
});
