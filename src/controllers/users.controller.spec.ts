import { Test, TestingModule } from "@nestjs/testing";
import { mock, MockProxy } from "jest-mock-extended";
import { UserClaimsDbModel } from "../interfaces/db.types";
import { UserContextService } from "../services/user-context.service";
import { UserService } from "../services/user.service";
import { UsersController } from "./users.controller";

const getStubUser = (): UserClaimsDbModel => ({
  id: 1,
  createdAt: new Date(),
  createdBy: "testUserId",
  updatedAt: new Date(),
  updatedBy: "testUserId",
  username: "testUsername",
  passwordHash: null,
  passwordSalt: null,
  accessFailedCount: null,
  isLocked: false,
  isLockedUntil: null,
  claims: [],
});

describe(UsersController.name, () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserContextService,
          useFactory: () => mock<UserContextService>(),
        },
        {
          provide: UserService,
          useFactory: () => mock<UserService>(),
        },
      ],
    }).compile();
  });

  it("should return UserService.findById() result called with ID when get() called", async () => {
    const stubUser = getStubUser();
    const mockUserService = testingModule.get(UserService) as MockProxy<UserService>;
    mockUserService.findById.mockResolvedValue(stubUser);

    const result = await testingModule.get(UsersController).get(1);

    expect(result).toEqual(stubUser);
    expect(mockUserService.findById).toHaveBeenCalledWith(1);
  });

  it("should return UserService.create() result called with body and user ID when post() called", async () => {
    const stubUser = getStubUser();
    const mockUserService = testingModule.get(UserService) as MockProxy<UserService>;
    mockUserService.create.mockResolvedValue(stubUser);
    const mockUserContextService = testingModule.get(
      UserContextService
    ) as MockProxy<UserContextService>;
    mockUserContextService.user = { sub: "testUserSub" };

    const postBody = {
      username: "testUsername",
      password: "testPassword",
      isLocked: false,
      claims: {},
    };
    const result = await testingModule.get(UsersController).post(postBody);

    expect(result).toEqual(stubUser);
    expect(mockUserService.create).toHaveBeenCalledWith(postBody, "testUserSub");
  });

  it("should return UserService.create() result called with ID, body, and user ID when patch() called", async () => {
    const stubUser = getStubUser();
    const mockUserService = testingModule.get(UserService) as MockProxy<UserService>;
    mockUserService.updateById.mockResolvedValue(stubUser);
    const mockUserContextService = testingModule.get(
      UserContextService
    ) as MockProxy<UserContextService>;
    mockUserContextService.user = { sub: "testUserSub" };

    const postBody = {
      isLocked: true,
    };
    const result = await testingModule.get(UsersController).patch(1, postBody);

    expect(result).toEqual(stubUser);
    expect(mockUserService.updateById).toHaveBeenCalledWith(1, postBody, "testUserSub");
  });

  it("should return UserService.deleteById() result called with ID when delete() called", async () => {
    const mockUserService = testingModule.get(UserService) as MockProxy<UserService>;
    mockUserService.deleteById.mockResolvedValue({ id: 1 });

    const result = await testingModule.get(UsersController).delete(1);

    expect(result).toEqual({ id: 1 });
    expect(mockUserService.deleteById).toHaveBeenCalledWith(1);
  });
});
