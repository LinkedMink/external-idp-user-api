import { Test, TestingModule } from "@nestjs/testing";
import { mock, MockProxy } from "jest-mock-extended";
import { PasswordLoginDto } from "../dto/login.dto";
import { LoginService } from "../services/login.service";
import { LoginController } from "./login.controller";
import { NotImplementedException } from "@nestjs/common";

describe(LoginController.name, () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LoginService,
          useFactory: () => mock<LoginService>(),
        },
      ],
    }).compile();
  });

  it("should return LoginService.login() result called with body when post() called", async () => {
    const stubLoginResult = {
      token: "testToken",
    };
    const mockLoginService = testingModule.get(LoginService) as MockProxy<LoginService>;
    mockLoginService.login.mockResolvedValue(stubLoginResult);

    const postBody: PasswordLoginDto = {
      username: "testUsername",
      password: "testPassword",
    };
    const result = await testingModule.get(LoginController).post(postBody);

    expect(result).toEqual(stubLoginResult);
    expect(mockLoginService.login).toHaveBeenCalledWith(postBody);
  });

  it("should throw when postById() called", async () => {
    const loginController = testingModule.get(LoginController);

    const action = () => loginController.postById(1);

    expect(action).toThrow(expect.any(NotImplementedException));
  });
});
