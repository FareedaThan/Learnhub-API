import { RedisClientType } from "redis";

const keyBlacklist = "todo-jwt-blacklist";

export interface IRepositoryBlacklist {
  addBlackList(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}

export function newRepositoryBlacklist(
  db: RedisClientType<any, any, any>
): IRepositoryBlacklist {
  return new RepositoryBlacklist(db);
}

class RepositoryBlacklist implements IRepositoryBlacklist {
  private db: RedisClientType<any, any, any>;

  constructor(db: RedisClientType<any, any, any>) {
    this.db = db;
  }

  async addBlackList(token: string): Promise<void> {
    await this.db.sAdd(keyBlacklist, token);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return this.db.sIsMember(keyBlacklist, token);
  }
}
