"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRepositoryBlacklist = void 0;
const keyBlacklist = "todo-jwt-blacklist";
function newRepositoryBlacklist(db) {
    return new RepositoryBlacklist(db);
}
exports.newRepositoryBlacklist = newRepositoryBlacklist;
class RepositoryBlacklist {
    constructor(db) {
        this.db = db;
    }
    async addBlackList(token) {
        await this.db.sAdd(keyBlacklist, token);
    }
    async isBlacklisted(token) {
        return this.db.sIsMember(keyBlacklist, token);
    }
}
//# sourceMappingURL=blacklist.js.map