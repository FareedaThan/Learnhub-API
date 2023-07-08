import { PrismaClient } from "@prisma/client";

interface ICreateUser {
  username: string;
  name: string;
  password: string;
}

interface IUser extends ICreateUser {
  id: string;
}

export interface IRepositoryUser {
  createUser(user: ICreateUser): Promise<IUser>;
  getUser(username: string): Promise<IUser>;
  getUserInfo(id:string): Promise<IUser>
}

export function newRepositoryUser(db: PrismaClient): IRepositoryUser {
  return new RepositoryUser(db);
}

class RepositoryUser implements IRepositoryUser {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async createUser(user: ICreateUser): Promise<IUser> {
    return await this.db.user
      .create({ data: user })
      .catch((err) => Promise.reject(`failed to create user ${user.username}`));
  }

  async getUser(username: string): Promise<IUser> {
    return await this.db.user
      .findUnique({ where: { username } })
      .then((user) => {
        if (!user) {
          return Promise.reject(`no such user ${username}`);
        }
        return Promise.resolve(user);
      });
  }

  async getUserInfo(id:string): Promise<IUser>{
    return await this.db.user.findUnique({where: {id}}).then((id) => {
      if (!id) {
        return Promise.reject(`no such user ${id}`);
      }
      return Promise.resolve(id);
    });
  }

}
