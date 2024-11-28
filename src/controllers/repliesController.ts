import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../utils/db";
import { checkAuth, optionalAuth } from "../utils/middleware";

export const getCommentReplies = optionalAuth(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { commentID } = req.query;
    const userId = req.user?.userId;

    if (!commentID) {
      return res.status(400).json({ message: "Comment ID is required." });
    }

    try {
      const replies = await prisma.comment.findMany({
        where: {
          parentId: parseInt(commentID),
          OR: [
            { hidden: false },
            { hidden: true, userId }, // Allow viewing hidden comments by their author
          ],
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          ratings: true,
          replies: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                },
              },
              ratings: true,
              _count: {
                select: {
                  replies: true, // Include reply count for nested replies
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          _count: {
            select: {
              replies: true, // Include reply count
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const formattedReplies = replies.map((reply) => ({
        ...reply,
        replyCount: reply._count.replies,
      }));

      res.status(200).json({ replies: formattedReplies });
    } catch (error) {
      console.error("Failed to fetch replies:", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching replies." });
    }
  },
);
