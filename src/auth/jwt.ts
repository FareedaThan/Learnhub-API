import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { IRepositoryBlacklist } from "../repositories/blacklist";

const secret = "my-super-secret";

// JWT Payload register
export interface Payload {
  id: string;
  username: string;
}

// To create JWT using .sign
export function newJwt(data: Payload): string {
  return jwt.sign(data, secret, {
    algorithm: "HS512",
    expiresIn: "12h", // value return in unix time
    issuer: "academy", // who creates jwt
    subject: "learnhub-api", // what this issue is created for
    audience: "students", //who will use this issue
  });
}

export interface JwtAuthRequest<Params, Body>
  extends Request<Params, any, Body> {
  token: string;
  payload: Payload;
}

export function newMiddlewareJwt(repoBlacklist: IRepositoryBlacklist) {
  return new MiddlewareJwt(repoBlacklist);
}

class MiddlewareJwt {
  private repoBlacklist: IRepositoryBlacklist;

  constructor(repoBlacklist: IRepositoryBlacklist) {
    this.repoBlacklist = repoBlacklist;
  }

  async jwtMiddleware(
    req: JwtAuthRequest<any, any>,
    res: Response,
    next: NextFunction
  ) {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      // Check that did we have token
      if (!token) {
        return res.status(400).json({ error: "missing JWT token" }).end();
      }

      const isBlacklisted = await this.repoBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({ error: `Your token has been deleted. Please log in.` }).end();
      }

      const decoded = jwt.verify(token, secret);

      if (!decoded["id"]) {
        return res.status(400).json({ error: "missing payload id" }).end();
      }
      if (!decoded["username"]) {
        return res
          .status(400)
          .json({ error: "missing payload username" })
          .end();
      }

      req.token = token;

      req.payload = {
        id: decoded["id"],
        username: decoded["username"],
      };

      return next();
    } catch (err) {
      // if our token is invalid
      console.error(`Auth failed for token ${token}: ${err}`);
      return res.status(400).json({ error: "authentication failed" }).end();
    }
  }
}
