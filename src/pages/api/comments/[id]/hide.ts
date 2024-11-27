import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../utils/db";
import { checkAuth } from "../../../../utils/middleware";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const postId = parseInt(req.query.id);
  const userId = req.user?.userId;
  const { hidden } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
    },
  });

  if (user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  try {
    const post = await prisma.comment.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await prisma.comment.update({
      where: { id: postId },
      data: { hidden: hidden, reported: true, canEdit: false },
    });

    return res.status(200).json({ message: "Blog post successfully hidden" });
  } catch (error) {
    console.error("Error hiding blog post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default checkAuth(handler);
