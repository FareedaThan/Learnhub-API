"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import dotenv from "dotenv";
const user_1 = require("./repositories/user");
const content_1 = require("./handlers/content");
const user_2 = require("./handlers/user");
const content_2 = require("./repositories/content");
const blacklist_1 = require("./repositories/blacklist");
const redis_1 = require("redis");
const jwt_1 = require("./auth/jwt");
async function main() {
    // dotenv.config();
    // console.log(process.env.PORT);
    const db = new client_1.PrismaClient();
    const redis = (0, redis_1.createClient)();
    await redis.connect();
    const port = process.env.PORT || 8000;
    const server = (0, express_1.default)();
    const userRouter = express_1.default.Router();
    const authRouter = express_1.default.Router();
    const contentRouter = express_1.default.Router();
    const repoBlacklist = (0, blacklist_1.newRepositoryBlacklist)(redis);
    const repoUser = (0, user_1.newRepositoryUser)(db);
    const handlerUser = (0, user_2.newHandlerUser)(repoUser, repoBlacklist);
    const repoContent = (0, content_2.newRepositoryContent)(db);
    const handlerContent = (0, content_1.newHandlerContent)(repoContent);
    const middlewareJwt = (0, jwt_1.newMiddlewareJwt)(repoBlacklist);
    server.use(express_1.default.json());
    server.use((0, cors_1.default)());
    server.use("/user", userRouter);
    server.use("/auth", authRouter);
    server.use("/content", contentRouter);
    // Auth API
    // To login
    authRouter.post("/login", handlerUser.login.bind(handlerUser));
    authRouter.get("/me", middlewareJwt.jwtMiddleware.bind(middlewareJwt), handlerUser.getMe.bind(handlerUser));
    authRouter.get("/logout", middlewareJwt.jwtMiddleware.bind(middlewareJwt), handlerUser.logout.bind(handlerUser));
    // User API
    // To register
    userRouter.post("/", handlerUser.register.bind(handlerUser));
    // Content API
    // contentRouter.use(middlewareJwt.jwtMiddleware.bind(middlewareJwt));
    contentRouter.post("/", middlewareJwt.jwtMiddleware.bind(middlewareJwt), handlerContent.createContent.bind(handlerContent));
    contentRouter.get("/", handlerContent.getContents.bind(handlerContent));
    contentRouter.get("/:id", handlerContent.getContentsById.bind(handlerContent));
    contentRouter.patch("/:id", middlewareJwt.jwtMiddleware.bind(middlewareJwt), handlerContent.updateUserContentById.bind(handlerContent));
    contentRouter.delete("/:id", middlewareJwt.jwtMiddleware.bind(middlewareJwt), handlerContent.deleteUserContentById.bind(handlerContent));
    server.listen(port, () => console.log(`server listening on ${port}`));
}
main();
//# sourceMappingURL=index.js.map