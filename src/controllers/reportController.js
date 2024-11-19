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
  const userRole = req.user?.role;
  const { postId, commentId } = req.query;

  if (userRole === "ADMIN") {
    if (postId) {
      const reports = await prisma.report.findMany({
        where: { blogPostId: parseInt(postId) },
        include: { user: true },
      });

      return res.status(200).json(reports);
    } else if (commentId) {
      const reports = await prisma.report.findMany({
        where: { commentId: parseInt(commentId) },
        include: { user: true },
      });

      return res.status(200).json(reports);
    } else {
      return res
        .status(400)
        .json({ message: "Missing postId or commentId in query" });
    }
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
