"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRepositoryContent = void 0;
function newRepositoryContent(db) {
    return new RepositoryContent(db);
}
exports.newRepositoryContent = newRepositoryContent;
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
};
class RepositoryContent {
    constructor(db) {
        this.db = db;
    }
    async createContent(arg) {
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
    async getContents() {
        return await this.db.content.findMany({ include: includeUser });
    }
    async getContentsById(id) {
        return await this.db.content.findUnique({ where: { id }, include: includeUser });
    }
    async updateUserContentById(arg) {
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
    async deleteUserContentById(arg) {
        const content = await this.db.content.findFirst({
            where: { id: arg.id, ownerId: arg.ownerId },
        });
        if (!content) {
            return Promise.reject(`no content ${arg.id}`);
        }
        return await this.db.content.delete({ where: { id: arg.id } });
    }
}
//# sourceMappingURL=content.js.map