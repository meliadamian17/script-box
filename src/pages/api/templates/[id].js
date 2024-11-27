import prisma from "../../../utils/db";
import { checkAuth } from "../../../utils/middleware";

const handler = async (req, res) => {
  const userId = req.user?.userId;
  const { id, viewOnly } = req.query;

  if (req.method === "GET") {
    try {
      const template = await prisma.template.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Check if user has access unless `viewOnly` is true
      if (!viewOnly && template.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Access denied to this template." });
      }

      res.status(200).json(template);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Failed to fetch template | ${error.message}` });
    }
  } else if (req.method === "PUT") {
    const { title, description, code, language, tags } = req.body;

    try {
      const existingTemplate = await prisma.template.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!existingTemplate || existingTemplate.userId !== userId) {
        return res
          .status(403)
          .json({ error: "You do not have permission to edit this template." });
      }

      const updatedTemplate = await prisma.template.update({
        where: { id: parseInt(id, 10) },
        data: {
          title: title || undefined,
          description: description || undefined,
          code: code || undefined,
          language: language || undefined,
          tags: tags || undefined,
        },
      });

      res.status(200).json(updatedTemplate);
    } catch (error) {
      res
        .status(400)
        .json({ error: `Failed to update template | ${error.message}` });
    }
  } else if (req.method === "DELETE") {
    try {
      const existingTemplate = await prisma.template.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!existingTemplate || existingTemplate.userId !== userId) {
        return res.status(403).json({
          error: "You do not have permission to delete this template.",
        });
      }

      await prisma.template.delete({ where: { id: parseInt(id, 10) } });

      res.status(204).end();
    } catch (error) {
      res
        .status(400)
        .json({ error: `Failed to delete template | ${error.message}` });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default checkAuth(handler);
