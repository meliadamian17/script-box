import prisma from "../../../utils/db";
import { checkAuth } from "../../../utils/middleware";
import { paginate } from "../../../utils/pagination";

const handler = async (req, res) => {
  const userId = req.user?.userId;
  const { title, tags, content, page, limit, ownedByUser } = req.query;

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

      if (ownedByUser === "true" && userId) {
        queryOptions.where.userId = userId;
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

      res.status(200).json({
        templates,
        pagination: {
          ...paginationMeta,
          totalItems,
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch templates | ${error}` });
    }
  } else if (req.method === "POST") {
    const { title, description, code, language, tags } = req.body;

    try {
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

      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ error: `Failed to create template | ${error}` });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default checkAuth(handler);
