import prisma from "../../../utils/db";
import { paginate } from "../../../utils/pagination";
import { checkAuth } from "../../../utils/middleware";

const handler = async (req, res) => {
  const { title, tags, content, page, limit, ownedByUser, publicOnly } =
    req.query;

  const userId = req.user?.userId;

  if (req.method === "GET") {
    try {
      const queryOptions = {
        where: {},
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
              email: true,
            },
          },
        },
      };

      if (title) {
        queryOptions.where.title = { contains: title };
      }

      if (tags) {
        const tagsArray = tags.split(",");
        queryOptions.where.tags = { hasSome: tagsArray };
      }

      if (content) {
        queryOptions.where.OR = [
          { description: { contains: content } },
          { code: { contains: content } },
        ];
      }

      if (req.query.ids) {
        const ids = req.query.ids.split(",").map((id) => parseInt(id, 10));
        queryOptions.where.id = { in: ids };
      }

      if (ownedByUser === "true") {
        if (!userId) {
          return res
            .status(401)
            .json({ error: "Unauthorized, user not logged in" });
        }
        queryOptions.where.userId = userId;
      }

      if (publicOnly === "true") {
        delete queryOptions.where.userId;
      }

      const { skip, take, paginationMeta } = paginate({ page, limit });

      const templates = await prisma.template.findMany({
        ...queryOptions,
        skip,
        take,
      });

      const totalItems = await prisma.template.count({
        where: queryOptions.where,
      });
      const totalPages = Math.ceil(totalItems / paginationMeta.pageSize);

      return res.status(200).json({
        templates,
        pagination: {
          ...paginationMeta,
          totalItems,
          totalPages,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: `Failed to fetch templates | ${error.message}` });
    }
  } else if (req.method === "POST") {
    const { title, description, code, language, tags } = req.body;

    try {
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized, user not logged in" });
      }

      const template = await prisma.template.create({
        data: {
          title,
          description,
          code,
          language,
          tags,
          userId,
        },
      });

      return res.status(201).json(template);
    } catch (error) {
      return res
        .status(400)
        .json({ error: `Failed to create template | ${error.message}` });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;

    try {
      if (!userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized, user not logged in" });
      }

      const template = await prisma.template.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!template || template.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Forbidden, cannot delete this template" });
      }

      await prisma.template.delete({ where: { id: parseInt(id, 10) } });

      return res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
      return res
        .status(400)
        .json({ error: `Failed to delete template | ${error.message}` });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default async (req, res) => {
  const { publicOnly } = req.query;

  if (req.method === "GET" && publicOnly === "true") {
    return handler(req, res);
  }

  return checkAuth(handler)(req, res);
};
