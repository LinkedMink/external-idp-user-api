import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { UserClaimsDbModel } from "../interfaces/db.types";
import { UserResponseDto } from "../dto/user.dto";

@Injectable()
export class UsersTransformInterceptor
  implements NestInterceptor<UserClaimsDbModel, UserResponseDto>
{
  intercept(
    _: ExecutionContext,
    next: CallHandler<UserClaimsDbModel>
  ): Observable<UserResponseDto> {
    return next.handle().pipe(
      map(data => ({
        id: data.id,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
        username: data.username,
        accessFailedCount: data.accessFailedCount,
        isLocked: data.isLocked,
        isLockedUntil: data.isLockedUntil,
        claims: Object.fromEntries(data.claims.map(c => [c.key, c.value])),
      }))
    );
  }
}
