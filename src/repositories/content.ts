import { PrismaClient } from "@prisma/client";

// Interface to write on db
interface ICreateContent {
  videoUrl: string;
  comment: string;
  rating: number;
  ownerId: string;
  videoTitle: string;
  thumbnailUrl: string;
  creatorName: string;
  creatorUrl: string;
}

interface IContent extends ICreateContent {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRepositoryContent {
  createContent(arg: ICreateContent): Promise<IContent>;
  getContents(): Promise<IContent[]>;
  getContentsById(id: number): Promise<IContent | null>;
  updateUserContentById(arg: {
    id: number;
    ownerId: string;
    comment: string | undefined;
    rating: number;
  }): Promise<IContent>;
  deleteUserContentById(arg: {
    id: number;
    ownerId: string;
  }): Promise<IContent>;
}

export function newRepositoryContent(db: PrismaClient): IRepositoryContent {
  return new RepositoryContent(db);
}

const includeUser = {
  postedBy: {
    select: {
      id: true,
      username: true,
      name: true,
      password: false,
      registeredAt: true,
    },
  },
}

class RepositoryContent implements IRepositoryContent {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async createContent(arg: ICreateContent): Promise<IContent> {
    return await this.db.content.create({
      include: includeUser,
      data: { 
        ...arg,
        ownerId: undefined,
        postedBy: {
          connect: {
            id: arg.ownerId,
          },
        },
      },
    });
  }

  async getContents(): Promise<IContent[]> {
    return await this.db.content.findMany({include: includeUser});
  }

  async getContentsById(id: number): Promise<IContent | null> {
    return await this.db.content.findUnique({ where: { id },  include: includeUser});
  }

  async updateUserContentById(arg: {
    id: number;
    ownerId: string;
    comment: string | undefined;
    rating: number;
  }): Promise<IContent> {
    const content = await this.db.content.findUnique({ where: { id: arg.id } });

    if (!content) {
      return Promise.reject(`no content ${arg.id}`);
    }

    if (content.ownerId !== arg.ownerId) {
      return Promise.reject(`wrong owner${arg.ownerId}`);
    }

    return await this.db.content.update({
      where: { id: arg.id },
      data: { comment: arg.comment, rating: arg.rating },
    });
  }

  async deleteUserContentById(arg: {
    id: number;
    ownerId: string;
  }): Promise<IContent> {
    const content = await this.db.content.findFirst({
      where: { id: arg.id, ownerId: arg.ownerId },
    });

    if (!content) {
      return Promise.reject(`no content ${arg.id}`);
    }

    return await this.db.content.delete({ where: { id: arg.id } });
  }
}
