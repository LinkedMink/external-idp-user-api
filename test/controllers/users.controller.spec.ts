import { Test, TestingModule } from "@nestjs/testing";
import { mock, MockProxy } from "jest-mock-extended";
import { UserClaimsDbModel } from "../../src/interfaces/db.types.js";
import { UserContextService } from "../../src/services/user-context.service.js";
import { UserService } from "../../src/services/user.service.js";
import { UsersController } from "../../src/controllers/users.controller.js";

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
    const mockUserService: MockProxy<UserService> = testingModule.get(UserService);
    mockUserService.findById.mockResolvedValue(stubUser);

    const result = await testingModule.get(UsersController).get(1);

    expect(result).toEqual(stubUser);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUserService.findById).toHaveBeenCalledWith(1);
  });

  it("should return UserService.create() result called with body and user ID when post() called", async () => {
    const stubUser = getStubUser();
    const mockUserService: MockProxy<UserService> = testingModule.get(UserService);
    mockUserService.create.mockResolvedValue(stubUser);
    const mockUserContextService: MockProxy<UserContextService> =
      testingModule.get(UserContextService);
    mockUserContextService.user = { sub: "testUserSub" };

    const postBody = {
      username: "testUsername",
      password: "testPassword",
      isLocked: false,
      claims: {},
    };
    const result = await testingModule.get(UsersController).post(postBody);

    expect(result).toEqual(stubUser);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUserService.create).toHaveBeenCalledWith(postBody, "testUserSub");
  });

  it("should return UserService.create() result called with ID, body, and user ID when patch() called", async () => {
    const stubUser = getStubUser();
    const mockUserService: MockProxy<UserService> = testingModule.get(UserService);
    mockUserService.updateById.mockResolvedValue(stubUser);
    const mockUserContextService: MockProxy<UserContextService> =
      testingModule.get(UserContextService);
    mockUserContextService.user = { sub: "testUserSub" };

    const postBody = {
      isLocked: true,
    };
    const result = await testingModule.get(UsersController).patch(1, postBody);

    expect(result).toEqual(stubUser);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUserService.updateById).toHaveBeenCalledWith(1, postBody, "testUserSub");
  });

  it("should return UserService.deleteById() result called with ID when delete() called", async () => {
    const mockUserService: MockProxy<UserService> = testingModule.get(UserService);
    mockUserService.deleteById.mockResolvedValue({ id: 1 });

    const result = await testingModule.get(UsersController).delete(1);

    expect(result).toEqual({ id: 1 });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUserService.deleteById).toHaveBeenCalledWith(1);
  });
});
