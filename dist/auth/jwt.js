"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newMiddlewareJwt = exports.newJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = "my-super-secret";
// To create JWT using .sign
function newJwt(data) {
    return jsonwebtoken_1.default.sign(data, secret, {
        algorithm: "HS512",
        expiresIn: "12h",
        issuer: "academy",
        subject: "learnhub-api",
        audience: "students", //who will use this issue
    });
}
exports.newJwt = newJwt;
function newMiddlewareJwt(repoBlacklist) {
    return new MiddlewareJwt(repoBlacklist);
}
exports.newMiddlewareJwt = newMiddlewareJwt;
class MiddlewareJwt {
    constructor(repoBlacklist) {
        this.repoBlacklist = repoBlacklist;
    }
    async jwtMiddleware(req, res, next) {
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
            const decoded = jsonwebtoken_1.default.verify(token, secret);
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
        }
        catch (err) {
            // if our token is invalid
            console.error(`Auth failed for token ${token}: ${err}`);
            return res.status(400).json({ error: "authentication failed" }).end();
        }
    }
}
//# sourceMappingURL=jwt.js.map