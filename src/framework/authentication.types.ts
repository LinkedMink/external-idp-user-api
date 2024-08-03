import type { Request, Response } from "express";
import type { Query } from "express-serve-static-core";
import type { JWTPayload } from "jose";

export type RequestWithJwt = Request<
  {
    [key: string]: string;
  },
  unknown,
  unknown,
  Query,
  { user?: JWTPayload }
>;

export type ResponseWithJwt = Response<unknown, { user: JWTPayload }>;
