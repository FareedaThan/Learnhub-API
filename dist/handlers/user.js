"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newHandlerUser = void 0;
const bcrypt_1 = require("../auth/bcrypt");
const jwt_1 = require("../auth/jwt");
function newHandlerUser(repo, repoBlacklist) {
    return new HandlerUser(repo, repoBlacklist);
}
exports.newHandlerUser = newHandlerUser;
class HandlerUser {
    constructor(repo, repoBlacklist) {
        this.repo = repo;
        this.repoBlacklist = repoBlacklist;
    }
    async register(req, res) {
        const { username, name, password } = req.body;
        if (!username || !name || !password) {
            return res
                .status(400)
                .json({ error: "missing username or password" })
                .end();
        }
        const hashedPassword = (0, bcrypt_1.hashPassword)(password);
        return this.repo
            .createUser({ username, name, password: hashedPassword })
            .then((user) => res.status(200).json({ username, password: undefined }).end())
            .catch((err) => {
            console.log(`${err}`);
            return res.status(500).json({ error: `failed to register ` }).end();
        });
    }
    async login(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "missing username or password", statusCode: 401 })
                .end();
        }
        return this.repo
            .getUser(username)
            .then((user) => {
            if (!(0, bcrypt_1.compareHash)(password, user.password)) {
                return res
                    .status(401)
                    .json({ error: "invalid username or password", statusCode: 401 })
                    .end();
            }
            const payload = {
                id: user.id,
                username: user.username,
            };
            // Get token
            const token = (0, jwt_1.newJwt)(payload);
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
                .json({ error: `failed to login ${err}`, statusCode: 401 })
                .end();
        });
    }
    async logout(req, res) {
        return this.repoBlacklist
            .addBlackList(req.token)
            .then(() => res.status(200).json({ status: "logged out!" }).end())
            .catch((err) => {
            return res
                .status(500)
                .json({ error: `fail to add blacklist ${err}` })
                .end();
        });
    }
    async getMe(req, res) {
        return this.repo.getUserInfo(req.payload.id)
            .then((user) => res.status(200).json(user).end())
            .catch((err) => {
            return res
                .status(500)
                .json({ error: `fail to get me ${err}` })
                .end();
        });
    }
}
//# sourceMappingURL=user.js.map