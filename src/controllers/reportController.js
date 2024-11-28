import prisma from "../utils/db";
import { checkAuth } from "../utils/middleware";

export const reportItem = checkAuth(async (req, res) => {
  const userId = req.user?.userId;
  const { itemType, reason } = req.body;

  if (itemType === "COMMENT") {
    const { commentId } = req.body;
    const report = await prisma.report.create({
      data: {
        reason,
        userId,
        commentId,
      },
    });
    return res.status(201).json(report);
  } else if (itemType === "POST") {
    const { blogPostId } = req.body;
    const report = await prisma.report.create({
      data: {
        reason,
        userId,
        blogPostId,
      },
    });
    return res.status(201).json(report);
  } else {
    return res.status(400).json({ message: "Invalid item type" });
  }
});

export const getReports = checkAuth(async (req, res) => {
  const userId = req.user?.userId;

  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId),
    },
    select: {
      role: true,
    },
  });

  const userRole = user.role;

  if (userRole === "ADMIN") {
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        blogPost: {
          select: {
            id: true,
            title: true,
            content: true,
            hidden: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            hidden: true,
            blogPost: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the reports to include necessary details
    const formattedReports = reports.map((report) => {
      let blogPostLink = null;

      if (report.blogPost) {
        // Report is on a blog post
        blogPostLink = {
          id: report.blogPost.id,
          title: report.blogPost.title,
        };
      } else if (report.comment && report.comment.blogPost) {
        // Report is on a comment associated with a blog post
        blogPostLink = {
          id: report.comment.blogPost.id,
          title: report.comment.blogPost.title,
        };
      }

      return {
        id: report.id,
        reason: report.reason,
        createdAt: report.createdAt,
        user: report.user,
        blogPost: blogPostLink,
        comment: report.comment
          ? {
              id: report.comment.id,
              content: report.comment.content,
              hidden: report.comment.hidden,
            }
          : null,
        postContent: report.blogPost
          ? {
              content: report.blogPost.content,
              hidden: report.blogPost.hidden,
            }
          : null,
      };
    });

    return res.status(200).json({ reports: formattedReports });
  } else {
    return res.status(403).json({ message: "Unauthorized access" });
  }
});

export const handleReport = checkAuth(async (req, res) => {
  const userRole = req.user?.role;
  const { id } = req.query;
  const { itemType } = req.body;

  if (userRole === "ADMIN") {
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (itemType === "COMMENT" && report.commentId) {
      await prisma.comment.update({
        where: { id: report.commentId },
        data: { hidden: true, reported: true, canEdit: false },
      });
      return res.status(200).json({ message: "Comment reported and hidden" });
    } else if (itemType === "POST" && report.blogPostId) {
      await prisma.blogPost.update({
        where: { id: report.blogPostId },
        data: { hidden: true, reported: true, canEdit: false },
      });
      return res.status(200).json({ message: "Blog post reported and hidden" });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid item type or missing report details" });
    }
  } else {
    return res.status(403).json({ message: "Unauthorized access" });
  }
});
