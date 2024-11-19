import prisma from "../../../utils/db";
import { checkAuth } from "../../../utils/middleware";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, title, description, tags, code } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized: Only logged-in users can save a forked template.",
    });
  }

  try {
    const originalTemplate = await prisma.template.findUnique({
      where: { id: parseInt(id) },
    });

    if (!originalTemplate) {
      return res.status(404).json({ error: "Original template not found" });
    }

    const forkedTemplate = await prisma.template.create({
      data: {
        title: title || `${originalTemplate.title} (Forked)`,
        description: description || originalTemplate.description,
        code: code || originalTemplate.code,
        language: originalTemplate.language,
        tags: tags || originalTemplate.tags,
        userId,
        forkedFromId: originalTemplate.id,
      },
    });

    res.status(201).json(forkedTemplate);
  } catch (error) {
    res
      .status(400)
      .json({ error: `Failed to fork template | ${error.message}` });
  }
};

export default checkAuth(handler);
