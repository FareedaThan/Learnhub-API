import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors"
// import dotenv from "dotenv";

import { newRepositoryUser } from "./repositories/user";
import { newHandlerContent } from "./handlers/content";
import { newHandlerUser } from "./handlers/user";
import { newRepositoryContent } from "./repositories/content";
import { newRepositoryBlacklist } from "./repositories/blacklist";
import { createClient } from "redis";
import { newMiddlewareJwt } from "./auth/jwt";

async function main() {
  // dotenv.config();
  // console.log(process.env.PORT);

  const db = new PrismaClient();
  const redis = createClient();
  await redis.connect();

  const port = process.env.PORT || 8000;
  const server = express();
  const userRouter = express.Router();
  const authRouter = express.Router();
  const contentRouter = express.Router();

  const repoBlacklist = newRepositoryBlacklist(redis);
  const repoUser = newRepositoryUser(db);
  const handlerUser = newHandlerUser(repoUser, repoBlacklist);
  const repoContent = newRepositoryContent(db);
  const handlerContent = newHandlerContent(repoContent);
  const middlewareJwt = newMiddlewareJwt(repoBlacklist);

  server.use(express.json());
  server.use(cors());

  server.use("/user", userRouter);
  server.use("/auth", authRouter);
  server.use("/content", contentRouter);

  // Auth API
  // To login
  authRouter.post("/login", handlerUser.login.bind(handlerUser));
  authRouter.get("/me", middlewareJwt.jwtMiddleware.bind(middlewareJwt), handlerUser.getMe.bind(handlerUser));
  authRouter.get(
    "/logout",
    middlewareJwt.jwtMiddleware.bind(middlewareJwt),
    handlerUser.logout.bind(handlerUser)
  );

  // User API
  // To register
  userRouter.post("/", handlerUser.register.bind(handlerUser));

  // Content API
  // contentRouter.use(middlewareJwt.jwtMiddleware.bind(middlewareJwt));
  contentRouter.post("/", middlewareJwt.jwtMiddleware.bind(middlewareJwt),handlerContent.createContent.bind(handlerContent));
  contentRouter.get("/", handlerContent.getContents.bind(handlerContent));
  contentRouter.get(
    "/:id",
    handlerContent.getContentsById.bind(handlerContent)
  );
  contentRouter.patch(
    "/:id", middlewareJwt.jwtMiddleware.bind(middlewareJwt),
    handlerContent.updateUserContentById.bind(handlerContent)
  );
  contentRouter.delete(
    "/:id", middlewareJwt.jwtMiddleware.bind(middlewareJwt),
    handlerContent.deleteUserContentById.bind(handlerContent)
  );

  server.listen(port, () => console.log(`server listening on ${port}`));
}

main();
