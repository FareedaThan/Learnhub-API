import { Request, Response } from "express";

import { IRepositoryUser } from "../repositories/user";
import { compareHash, hashPassword } from "../auth/bcrypt";
import { JwtAuthRequest, Payload, newJwt } from "../auth/jwt";
import { Empty } from "./content";
import { IRepositoryBlacklist } from "../repositories/blacklist";

interface IHandlerUser {
  register(req: Request, res: Response): Promise<Response>;
  login(req: Request, res: Response): Promise<Response>;
  logout(req: JwtAuthRequest<Empty, Empty>, res: Response): Promise<Response>;
  getMe(req: JwtAuthRequest<Empty, Empty>, res: Response): Promise<Response>;
}

export function newHandlerUser(
  repo: IRepositoryUser,
  repoBlacklist: IRepositoryBlacklist
): IHandlerUser {
  return new HandlerUser(repo, repoBlacklist);
}

class HandlerUser implements IHandlerUser {
  private repo: IRepositoryUser;
  private repoBlacklist: IRepositoryBlacklist;

  constructor(repo: IRepositoryUser, repoBlacklist: IRepositoryBlacklist) {
    this.repo = repo;
    this.repoBlacklist = repoBlacklist;
  }

  async register(req: Request, res: Response): Promise<Response> {
    const { username, name, password } = req.body;
    if (!username || !name || !password) {
      return res
        .status(400)
        .json({ error: "missing username or password" })
        .end();
    }

    const hashedPassword = hashPassword(password);

    return this.repo
      .createUser({ username, name, password: hashedPassword })
      .then((user) =>
        res.status(200).json({ username, password: undefined }).end()
      )
      .catch((err) => {
        console.log(`${err}`);
        return res.status(500).json({ error: `failed to register ` }).end();
      });
  }

  async login(req: Request, res: Response): Promise<Response> {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "missing username or password" })
        .end();
    }

    return this.repo
      .getUser(username)
      .then((user) => {
        if (!compareHash(password, user.password)) {
          return res
            .status(401)
            .json({ error: "invalid username or password" })
            .end();
        }

        const payload: Payload = {
          id: user.id,
          username: user.username,
        };

        // Get token
        const token = newJwt(payload);

        return res
          .status(200)
          .json({
            status: "logged in",
            accessToken: token
          })
          .end();
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ error: `failed to login ${err}` })
          .end();
      });
  }

  async logout(
    req: JwtAuthRequest<Empty, Empty>,
    res: Response
  ): Promise<Response> {
    return this.repoBlacklist
      .addBlackList(req.token)
      .then(() =>
        res.status(200).json({ status: "logged out!" }).end()
      )
      .catch((err) => {
        return res
          .status(500)
          .json({ error: `fail to add blacklist ${err}` })
          .end();
      });
  }

  async getMe(
    req: JwtAuthRequest<Empty, Empty>,
    res: Response
  ): Promise<Response> {
    return this.repo.getUserInfo(req.payload.id)
    .then((user) => res.status(200).json(user).end())
    .catch((err) => {
      return res
        .status(500)
        .json({ error: `fail to get me ${err}` })
        .end();})
  }
}
