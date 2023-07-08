import { Request, Response } from "express";

import { IRepositoryContent } from "../repositories/content";
import { JwtAuthRequest } from "../auth/jwt";
import { getVideoDetails } from "../oembed";

export interface Empty {}

interface WithId {
  id: number;
}

interface WithComment {
  comment: string | undefined;
  rating: number;
}

interface WithContent extends WithComment {
  videoUrl: string;
}

interface IHandlerContent {
  createContent(
    req: JwtAuthRequest<Empty, WithContent>,
    res: Response
  ): Promise<Response>;
  getContents(req: Request, res: Response): Promise<Response>;
  getContentsById(req: Request, res: Response): Promise<Response>;
  updateUserContentById(
    req: JwtAuthRequest<WithId, WithComment>,
    res: Response
  ): Promise<Response>;
  deleteUserContentById(
    req: JwtAuthRequest<WithId, Empty>,
    res: Response
  ): Promise<Response>;
}

export function newHandlerContent(repo: IRepositoryContent): IHandlerContent {
  return new HandlerContent(repo);
}

class HandlerContent implements IHandlerContent {
  private repo: IRepositoryContent;

  constructor(repo: IRepositoryContent) {
    this.repo = repo;
  }

  async createContent(
    req: JwtAuthRequest<Empty, WithContent>,
    res: Response
  ): Promise<Response> {
    // TODO: Considering to increase ..Dto type
    const { videoUrl, comment, rating } = req.body;
    if (!videoUrl || !comment) {
      return res.status(400).json({ error: "Please fill videourl and comment" }).end();
    }

    const ownerId = req.payload.id;
    const videoInfo = await getVideoDetails(videoUrl);

    return this.repo
      .createContent({
        videoUrl,
        comment,
        rating,
        ownerId,
        videoTitle: videoInfo.videoTitle,
        thumbnailUrl: videoInfo.thumbnailUrl,
        creatorName: videoInfo.creatorName,
        creatorUrl: videoInfo.creatorUrl,
      })
      .then((content) => res.status(201).json(content).end())
      .catch((err) => {
        console.error({ err });
        return res
          .status(500)
          .json({ error: `failed to create content` })
          .end();
      });
  }

  async getContents(req: Request, res: Response): Promise<Response> {
    return this.repo
      .getContents()
      .then((contents) => res.status(200).json({data:contents}).end())
      .catch((err) => {
        return res
          .status(500)
          .json({ error: `failed to get contents ${err}` })
          .end();
      });
  }

  async getContentsById(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: `id ${id} is not a number` });
    }

    return this.repo
      .getContentsById(id)
      .then((content) => {
        if (!content) {
          return res
            .status(404)
            .json({ error: `content id ${id} not found` })
            .end();
        }

        return res.status(200).json(content).end();
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ error: `failed to get content id ${id} ${err}` });
      });
  }

  async updateUserContentById(
    req: JwtAuthRequest<WithId, WithComment>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: `id ${id} is not a number` });
    }

    let comment:string | undefined = req.body.comment
    let rating:number | undefined = req.body.rating
    if(!comment || comment === ""){
      comment = undefined
    }

    // const { comment, rating } = req.body;

    const ownerId = req.payload.id;

    return this.repo
      .updateUserContentById({ id, ownerId, comment, rating })
      .then((updatedContent) => res.status(201).json(updatedContent).end())
      .catch((err) => {
        return res.status(500).json({ error: `failed to update ${err}` });
      });
  }

  async deleteUserContentById(
    req: JwtAuthRequest<WithId, Empty>,
    res: Response
  ): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: `id ${id} is not a number` });
    }
    const ownerId = req.payload.id;

    return this.repo
      .deleteUserContentById({ id, ownerId })
      .then((deletedContent) => res.status(201).json(deletedContent).end())
      .catch((err) => {
        return res.status(500).json({ error: `failed to delete ${err}` });
      });
  }
}
