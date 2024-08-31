import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { IdDbModel, UserClaimsDbModel, UserDbModel } from "../interfaces/db.types.js";
import { UserClaimsResponseDto, UserResponseDto } from "../dto/user.dto.js";

@Injectable()
export class UsersTransformInterceptor
  implements
    NestInterceptor<
      IdDbModel | UserDbModel | UserClaimsDbModel,
      undefined | UserResponseDto | UserClaimsResponseDto
    >
{
  intercept(
    _: ExecutionContext,
    next: CallHandler<IdDbModel | UserDbModel | UserClaimsDbModel>
  ): Observable<undefined | UserResponseDto | UserClaimsResponseDto> {
    return next.handle().pipe(
      map(data => {
        if (!isUserDbModel(data)) {
          return;
        }

        return {
          id: data.id,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
          username: data.username,
          accessFailedCount: data.accessFailedCount,
          isLocked: data.isLocked,
          isLockedUntil: data.isLockedUntil,
          claims: isUserClaimsDbModel(data)
            ? Object.fromEntries(data.claims.map(c => [c.key, c.value]))
            : undefined,
        };
      })
    );
  }
}

function isUserDbModel(
  input: IdDbModel | UserDbModel | UserClaimsDbModel
): input is UserDbModel | UserClaimsDbModel {
  return typeof (input as UserDbModel).username === "string";
}

function isUserClaimsDbModel(input: UserDbModel | UserClaimsDbModel): input is UserClaimsDbModel {
  return !!(input as UserClaimsDbModel).claims;
}
