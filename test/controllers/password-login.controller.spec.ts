import { Test, TestingModule } from "@nestjs/testing";
import { mock, MockProxy } from "jest-mock-extended";
import { PasswordLoginDto } from "../../src/dto/login.dto.js";
import { PasswordLoginService } from "../../src/services/login-providers/password-login.service.js";
import { PasswordLoginController } from "../../src/controllers/password-login.controller.js";

describe(PasswordLoginController.name, () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [PasswordLoginController],
      providers: [
        {
          provide: PasswordLoginService,
          useFactory: () => mock<PasswordLoginService>(),
        },
      ],
    }).compile();
  });

  it("should return PasswordLoginService.login() result called with body when post() called", async () => {
    const stubLoginResult = {
      token: "testToken",
    };
    const mockLoginService: MockProxy<PasswordLoginService> =
      testingModule.get(PasswordLoginService);
    mockLoginService.login.mockResolvedValue(stubLoginResult);

    const postBody: PasswordLoginDto = {
      username: "testUsername",
      password: "testPassword",
    };
    const result = await testingModule.get(PasswordLoginController).post(postBody);

    expect(result).toEqual(stubLoginResult);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockLoginService.login).toHaveBeenCalledWith(postBody);
  });
});
